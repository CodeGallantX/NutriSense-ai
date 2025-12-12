from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, Form
from io import BytesIO
from PIL import Image
from pathlib import Path
import json
import os
import numpy as np
from typing import List, Dict, Any
from app.services.classification_service import classify_food

app = FastAPI(title="NutriSense API", version="1.0")

BASE_DIR = Path(__file__).resolve().parent

# YOLO models
YOLO_PATH = BASE_DIR / "ml_models" / "yolo" / "best.onnx"
YOLO_SEG_PATH = BASE_DIR / "ml_models" / "yolo" / "best-seg.onnx"
_yolo_model = None
_yolo_seg_model = None

def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        if not YOLO_PATH.exists():
            raise FileNotFoundError(f"YOLO model not found at {YOLO_PATH}")
        _yolo_model = YOLO(str(YOLO_PATH))
    return _yolo_model

def get_yolo_seg_model():
    global _yolo_seg_model
    if _yolo_seg_model is None:
        if YOLO_SEG_PATH.exists():
            _yolo_seg_model = YOLO(str(YOLO_SEG_PATH))
        else:
            _yolo_seg_model = None
    return _yolo_seg_model

NUTRITION_PATH = BASE_DIR / "data" / "nutrition_db.json"
GI_PATH = BASE_DIR / "data" / "glycemic_index.json"

def _load_json_or_empty(path: Path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

nutrition_db = _load_json_or_empty(NUTRITION_PATH)
gi_db = _load_json_or_empty(GI_PATH)


def get_food_info(food_name: str, confidence: float):
    nutrition = nutrition_db.get(food_name, {})
    calories = nutrition.get("calories")
    carbs = nutrition.get("carbs")
    protein = nutrition.get("protein")
    fat = nutrition.get("fat")
    fiber = nutrition.get("fiber")
    gi = gi_db.get(food_name)
    flags = nutrition.get("flags", [])
    health_warnings = nutrition.get("warnings", {})
    
    # Basic advice based on GI
    if gi is None:
        advice = "No GI data available"
    elif gi < 55:
        advice = "Low GI – safer for diabetes"
    elif 55 <= gi <= 69:
        advice = "Medium GI – moderate consumption advised"
    else:
        advice = "High GI – minimize for diabetes"

    return {
        "name": food_name,
        "confidence": confidence,
        "calories": calories,
        "carbs": carbs,
        "protein": protein,
        "fat": fat,
        "fiber": fiber,
        "glycemic_index": gi,
        "advice": advice,
        "flags": flags,
        "health_warnings": health_warnings
    }

def _estimate_portion(mask_area: float, food_name: str) -> float:
    # Simple heuristic: reference area per serving ~4000 pixels; clamp 0.3x-2x
    ref_area = 4000
    portion = max(0.3, min(2.0, mask_area / ref_area))
    return portion

def _apply_flag_heuristics(info: dict) -> dict:
    name_lower = info.get("name", "").lower()
    flags = set(info.get("flags", []))
    if "fried" in name_lower:
        flags.add("fried")
    if "pepper" in name_lower or "spicy" in name_lower:
        flags.add("spicy")
    if "soup" in name_lower:
        flags.add("soup")
    if "stew" in name_lower:
        flags.add("stew")
    if "rice" in name_lower or "yam" in name_lower or "fufu" in name_lower or "plantain" in name_lower:
        flags.add("carb-heavy")
    info["flags"] = list(flags)
    return info

def _apply_portion_scaling(info: dict, portion: float) -> dict:
    scaled = info.copy()
    for key in ["calories", "carbs", "protein", "fat", "fiber"]:
        if scaled.get(key) is not None:
            scaled[key] = round(scaled[key] * portion, 2)
    return scaled

def _handle_detection(results_dict: dict, food_name: str, conf_val: float, user_health: dict, portion: float | None = None):
    info = get_food_info(food_name, conf_val)
    if portion is not None:
        info = _apply_portion_scaling(info, portion)
    info = _apply_flag_heuristics(info)
    info["advice"] = personalize_advice(info, user_health)
    return info

def analyze_image(img: Image.Image, user_health: dict):
    results_dict = {}  # deduplicate by food name
    seg_model = get_yolo_seg_model()

    # Prefer segmentation if available
    if seg_model:
        seg_results = seg_model.predict(img)
        for r in seg_results:
            masks = getattr(r, "masks", None)
            if masks is None:
                continue
            for mask, cls_id, conf in zip(masks.data, r.boxes.cls, r.boxes.conf):
                mask_np = mask.cpu().numpy()
                mask_area = float(mask_np.sum())
                portion = _estimate_portion(mask_area, seg_model.names[int(cls_id)])
                food_name = seg_model.names[int(cls_id)]
                conf_val = float(conf)
                info = _handle_detection(results_dict, food_name, conf_val, user_health, portion)
                info["source"] = "YOLO-SEG"
                if food_name not in results_dict or conf_val > results_dict[food_name]["confidence"]:
                    results_dict[food_name] = info

    # Fallback to bounding-box YOLO (and also run to complement seg)
    yolo_model = get_yolo_model()
    yolo_results = yolo_model.predict(img)
    for r in yolo_results:
        for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
            food_name = yolo_model.names[int(cls_id)]
            conf_val = float(conf)
            info = _handle_detection(results_dict, food_name, conf_val, user_health)
            info["source"] = "YOLO" if food_name not in results_dict else results_dict[food_name].get("source", "YOLO")
            if food_name not in results_dict or conf_val > results_dict[food_name]["confidence"]:
                results_dict[food_name] = info

    # Hierarchical classification on low-confidence items or when empty
    should_run_classifier = (
        not results_dict or 
        max([f["confidence"] for f in results_dict.values()]) < 0.5
    )

    if should_run_classifier:
        try:
            classifier_results = classify_food(img)
            for res in classifier_results[:5]:  # top 5 from classifier
                food_name = res["label"]
                conf_val = float(res["score"])
                if food_name not in results_dict or conf_val > results_dict[food_name]["confidence"]:
                    info = _handle_detection(results_dict, food_name, conf_val, user_health)
                    info["source"] = "Classifier" if food_name not in results_dict else "YOLO+Classifier"
                    results_dict[food_name] = info
        except Exception:
            pass

    results_list = sorted(results_dict.values(), key=lambda x: x["confidence"], reverse=True)[:5]
    return results_list

def personalize_advice(food_info: dict, user_health: dict):
    advice = food_info.get("advice", "")
    warnings = []
    name_lower = food_info.get("name", "").lower()
    flags = set(food_info.get("flags", []))
    health_warnings = food_info.get("health_warnings", {})
    
    # Diabetes warnings
    gi = food_info.get("glycemic_index")
    carbs = food_info.get("carbs")
    if user_health.get("diabetes"):
        if gi is not None and gi > 55:
            warnings.append("⚠️ High GI - limit intake for diabetes")
        if carbs and carbs > 30:
            warnings.append("⚠️ High carbs - monitor blood sugar")
        if health_warnings.get("diabetes"):
            warnings.append(health_warnings["diabetes"])
    
    # Hypertension warnings
    food_lower = food_info.get("name", "").lower()
    if user_health.get("hypertension"):
        high_sodium_foods = ["fried chicken", "stew", "pepper soup", "jollof rice"]
        if any(food in food_lower for food in high_sodium_foods):
            warnings.append("⚠️ May be high in sodium - limit for hypertension")
        if health_warnings.get("hypertension"):
            warnings.append(health_warnings["hypertension"])
    
    # Ulcer warnings
    if user_health.get("ulcer"):
        irritating_foods = ["pepper soup", "fried", "stew"]
        if any(food in food_lower for food in irritating_foods):
            warnings.append("⚠️ May irritate ulcers - consume with caution")
        if health_warnings.get("ulcer"):
            warnings.append(health_warnings["ulcer"])

    # Acid reflux / GERD
    if user_health.get("acid_reflux"):
        if any(flag in flags for flag in ["fried", "spicy", "acidic"]):
            warnings.append("⚠️ May trigger reflux")
        if health_warnings.get("acid_reflux"):
            warnings.append(health_warnings["acid_reflux"])
    
    # Weight management
    calories = food_info.get("calories")
    if user_health.get("weight_loss") and calories and calories > 200:
        warnings.append("ℹ️ High calorie - consider portion control")
    
    # Combine advice with warnings
    if warnings:
        advice += " " + " ".join(warnings)
    
    return advice.strip()

def calculate_meal_totals(foods: list) -> dict:
    """Calculate total nutrition and glycemic load for the entire meal"""
    totals = {
        "total_calories": 0,
        "total_carbs": 0,
        "total_protein": 0,
        "total_fat": 0,
        "total_fiber": 0,
        "glycemic_load": 0,
        "item_count": len(foods)
    }
    
    for food in foods:
        totals["total_calories"] += food.get("calories") or 0
        totals["total_carbs"] += food.get("carbs") or 0
        totals["total_protein"] += food.get("protein") or 0
        totals["total_fat"] += food.get("fat") or 0
        totals["total_fiber"] += food.get("fiber") or 0
        
        # Calculate glycemic load: (GI × carbs) / 100
        gi = food.get("glycemic_index")
        carbs = food.get("carbs")
        if gi and carbs:
            totals["glycemic_load"] += (gi * carbs) / 100
    
    return totals

def _component_scores(foods: List[Dict[str, Any]], totals: dict, user_health: dict) -> Dict[str, float]:
    unique_foods = len({f.get("name") for f in foods})
    diversity = min(100.0, unique_foods * 15)

    # Nutrient completeness: presence of protein, fiber, and balanced macros
    completeness = 50.0
    if totals["total_protein"] >= 20:
        completeness += 20
    if totals["total_fiber"] >= 8:
        completeness += 20
    if 30 <= totals["total_carbs"] <= 70:
        completeness += 10

    # Glycemic load score (lower GL is better)
    gl = totals["glycemic_load"]
    if gl <= 10:
        gl_score = 100
    elif gl <= 20:
        gl_score = 70
    elif gl <= 30:
        gl_score = 40
    else:
        gl_score = 20

    # Fiber adequacy
    fiber_score = 100 if totals["total_fiber"] >= 10 else (70 if totals["total_fiber"] >= 5 else 40)

    # Protein adequacy
    protein_score = 100 if totals["total_protein"] >= 25 else (70 if totals["total_protein"] >= 15 else 40)

    # Fat quality: penalize fried/fatty flags
    fried_count = sum(1 for f in foods if "fried" in f.get("flags", []))
    fat_score = max(40.0, 100 - fried_count * 15)

    # Sodium/processed penalty: rough proxy via salty/stew/fried flags
    sodium_penalty = sum(1 for f in foods if any(flag in f.get("flags", []) for flag in ["salty", "stew", "fried"])) * 10
    sodium_score = max(40.0, 100 - sodium_penalty)

    # Diabetes-friendly score (based on GL and flags)
    high_gi_flags = any("carb-heavy" in f.get("flags", []) for f in foods)
    if gl <= 12 and not high_gi_flags:
        diabetes_score = 100
    elif gl <= 20:
        diabetes_score = 75
    else:
        diabetes_score = 45

    return {
        "meal_diversity": diversity,
        "nutrient_completeness": completeness,
        "glycemic_load_score": gl_score,
        "fiber_adequacy": fiber_score,
        "protein_adequacy": protein_score,
        "fat_quality": fat_score,
        "sodium_penalty": sodium_score,
        "diabetes_friendly": diabetes_score
    }


def get_meal_score(foods: List[Dict[str, Any]], totals: dict, user_health: dict) -> dict:
    """Score the meal balance and provide recommendations using multiple components."""
    components = _component_scores(foods, totals, user_health)

    # Weighted composite
    score = (
        components["meal_diversity"] * 0.10 +
        components["nutrient_completeness"] * 0.20 +
        components["glycemic_load_score"] * 0.20 +
        components["fiber_adequacy"] * 0.15 +
        components["protein_adequacy"] * 0.15 +
        components["fat_quality"] * 0.10 +
        components["sodium_penalty"] * 0.05 +
        components["diabetes_friendly"] * 0.05
    )

    recommendations = []
    warnings = []

    if components["fiber_adequacy"] < 70:
        recommendations.append("Add vegetables/beans for fiber")
    if components["protein_adequacy"] < 70:
        recommendations.append("Add lean protein (fish, beans, chicken)")
    if components["glycemic_load_score"] < 70:
        warnings.append("⚠️ High glycemic load - add protein/fiber and reduce carbs")
    if components["fat_quality"] < 70:
        recommendations.append("Reduce fried items; prefer grilling/steaming")
    if components["sodium_penalty"] < 70:
        recommendations.append("Reduce salty/processed sauces and seasonings")

    # Quality buckets
    if score >= 85:
        quality = "Excellent"
    elif score >= 70:
        quality = "Good"
    elif score >= 50:
        quality = "Fair"
    elif score >= 30:
        quality = "Risky"
    else:
        quality = "Dangerous"

    return {
        "score": round(score, 1),
        "quality": quality,
        "components": components,
        "recommendations": recommendations,
        "warnings": warnings
    }


# --- Missing ingredient heuristics ---
MEAL_TEMPLATES = {
    "high_carb_low_protein": {
        "name": "Estimated Protein Side",
        "calories": 120,
        "carbs": 0,
        "protein": 15,
        "fat": 3,
        "fiber": 0,
        "glycemic_index": 0
    },
    "low_fiber": {
        "name": "Estimated Vegetables",
        "calories": 40,
        "carbs": 8,
        "protein": 2,
        "fat": 0,
        "fiber": 3,
        "glycemic_index": 15
    }
}

def apply_missing_ingredient_heuristics(foods: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not foods:
        return foods
    totals = calculate_meal_totals(foods)
    additions = []

    # If carbs dominate and protein is low, add estimated protein side
    if totals["total_carbs"] > 40 and totals["total_protein"] < 15:
        base = MEAL_TEMPLATES["high_carb_low_protein"].copy()
        base.update({"confidence": 0.3, "source": "Heuristic"})
        additions.append(base)

    # If fiber is very low, add estimated vegetables
    if totals["total_fiber"] < 5:
        base = MEAL_TEMPLATES["low_fiber"].copy()
        base.update({"confidence": 0.3, "source": "Heuristic"})
        additions.append(base)

    return foods + additions


def build_recommendations(foods: List[Dict[str, Any]], totals: dict) -> Dict[str, List[str]]:
    healthy_alternatives = []
    portion_adjustments = []
    additions = []

    for food in foods:
        flags = set(food.get("flags", []))
        name = food.get("name", "")
        if "fried" in flags:
            healthy_alternatives.append(f"Swap {name} -> grilled/roasted version")
        if "sweet" in flags:
            healthy_alternatives.append(f"Reduce added sugar; consider unsweetened options for {name}")
        if "carb-heavy" in flags:
            portion_adjustments.append(f"Reduce portion of {name}; pair with protein/fiber")
        if "spicy" in flags:
            healthy_alternatives.append(f"Use mild/spice-free preparation for {name}")

    if totals.get("total_carbs", 0) > 60:
        portion_adjustments.append("Reduce high-GI carbs; add protein to stabilize blood sugar")
    if totals.get("total_protein", 0) < 20:
        additions.append("Add lean protein (fish, chicken, beans)")
    if totals.get("total_fiber", 0) < 8:
        additions.append("Add vegetables/beans to boost fiber")

    return {
        "healthy_alternatives": healthy_alternatives,
        "portion_adjustments": portion_adjustments,
        "additions": additions
    }


def build_meal_analysis(foods: List[Dict[str, Any]], user_health: dict) -> dict:
    meal_totals = calculate_meal_totals(foods)
    meal_score = get_meal_score(foods, meal_totals, user_health)
    recs = build_recommendations(foods, meal_totals)
    return {
        "detected_items": foods,
        "meal_summary": {
            **meal_totals,
            **meal_score
        },
        "recommendations": recs
    }

# API Endpoints
@app.get("/")
def root():
    return {
        "message": "NutriSense API",
        "endpoints": ["/health", "/scan-food/"]
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "yolo_model_loaded": bool(_yolo_model is not None)
    }

@app.post("/scan-food/")
async def scan_food(
    file: UploadFile = File(...),
    diabetes: bool = Form(False),
    hypertension: bool = Form(False),
    ulcer: bool = Form(False),
    weight_loss: bool = Form(False)
):
    """
    Analyze a food image and provide comprehensive nutrition analysis.
    
    Returns:
    - Individual food items detected with nutrition info
    - Meal-level totals (calories, macros, glycemic load)
    - Balanced meal score and recommendations
    """
    user_health = {
        "diabetes": diabetes, 
        "hypertension": hypertension, 
        "ulcer": ulcer,
        "weight_loss": weight_loss
    }
    
    img = Image.open(BytesIO(await file.read()))
    foods = analyze_image(img, user_health)
    foods = apply_missing_ingredient_heuristics(foods)
    result = build_meal_analysis(foods, user_health)
    return result


@app.post("/analyze-meal")
async def analyze_meal(
    file: UploadFile = File(...),
    diabetes: bool = Form(False),
    hypertension: bool = Form(False),
    ulcer: bool = Form(False),
    weight_loss: bool = Form(False),
    acid_reflux: bool = Form(False)
):
    """
    Flagship endpoint: combined detection, nutrition, GI, scoring, recommendations.
    Returns per-item nutrition, GI, per-food flags, meal-level scores, and suggestions.
    """
    user_health = {
        "diabetes": diabetes,
        "hypertension": hypertension,
        "ulcer": ulcer,
        "weight_loss": weight_loss,
        "acid_reflux": acid_reflux
    }
    img = Image.open(BytesIO(await file.read()))
    foods = analyze_image(img, user_health)
    foods = apply_missing_ingredient_heuristics(foods)
    result = build_meal_analysis(foods, user_health)
    return result


@app.post("/confirm-detections/")
async def confirm_detections(
    detected_items: List[Dict[str, Any]],
    corrections: List[Dict[str, str]]
):
    """
    Apply user-provided corrections to detected items and recompute nutrition.
    corrections: list of {"original": "Jollof Rice", "actual": "Fried Rice"}
    """
    correction_map = {c.get("original"): c.get("actual") for c in corrections if c.get("original") and c.get("actual")}
    updated_items = []
    for item in detected_items:
        name = item.get("name")
        new_name = correction_map.get(name, name)
        confidence = item.get("confidence", 0.5)
        info = get_food_info(new_name, confidence)
        info["source"] = f"Corrected:{item.get('source','user')}"
        updated_items.append(info)

    meal_totals = calculate_meal_totals(updated_items)
    meal_analysis = get_meal_score(meal_totals, {})
    return {
        "detected_items": updated_items,
        "meal_summary": {
            **meal_totals,
            **meal_analysis
        }
    }
