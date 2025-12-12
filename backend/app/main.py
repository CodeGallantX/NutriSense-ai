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
        "advice": advice
    }

def _estimate_portion(mask_area: float, food_name: str) -> float:
    # Simple heuristic: reference area per serving ~4000 pixels; clamp 0.3x-2x
    ref_area = 4000
    portion = max(0.3, min(2.0, mask_area / ref_area))
    return portion

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
    
    # Diabetes warnings
    gi = food_info.get("glycemic_index")
    carbs = food_info.get("carbs")
    if user_health.get("diabetes"):
        if gi is not None and gi > 55:
            warnings.append("⚠️ High GI - limit intake for diabetes")
        if carbs and carbs > 30:
            warnings.append("⚠️ High carbs - monitor blood sugar")
    
    # Hypertension warnings
    food_lower = food_info.get("name", "").lower()
    if user_health.get("hypertension"):
        high_sodium_foods = ["fried chicken", "stew", "pepper soup", "jollof rice"]
        if any(food in food_lower for food in high_sodium_foods):
            warnings.append("⚠️ May be high in sodium - limit for hypertension")
    
    # Ulcer warnings
    if user_health.get("ulcer"):
        irritating_foods = ["pepper soup", "fried", "stew"]
        if any(food in food_lower for food in irritating_foods):
            warnings.append("⚠️ May irritate ulcers - consume with caution")
    
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

def get_meal_score(totals: dict, user_health: dict) -> dict:
    """Score the meal balance and provide recommendations"""
    score = 100
    recommendations = []
    warnings = []
    
    total_macros = totals["total_protein"] + totals["total_carbs"] + totals["total_fat"]
    
    if total_macros > 0:
        protein_pct = (totals["total_protein"] * 4 / (total_macros * 4)) * 100  # 4 cal/g
        carbs_pct = (totals["total_carbs"] * 4 / (total_macros * 4)) * 100
        fat_pct = (totals["total_fat"] * 9 / ((total_macros * 4) + (totals["total_fat"] * 5))) * 100  # 9 cal/g
        
        # Balanced meal targets: 30% protein, 40% carbs, 30% fat
        if protein_pct < 20:
            score -= 15
            recommendations.append("Add more protein (fish, chicken, beans)")
        elif protein_pct > 40:
            score -= 5
            warnings.append("High protein content")
        
        if carbs_pct > 60:
            score -= 20
            recommendations.append("Reduce carbs or add more vegetables")
        elif carbs_pct < 30:
            recommendations.append("Consider adding complex carbs for energy")
        
        if fat_pct > 40:
            score -= 10
            recommendations.append("High fat content - consider grilling instead of frying")
    
    # Fiber check
    if totals["total_fiber"] < 5:
        score -= 10
        recommendations.append("Add more fiber (vegetables, beans)")
    
    # Glycemic load assessment
    gl = totals["glycemic_load"]
    if gl > 20:
        warnings.append("⚠️ High glycemic load - may spike blood sugar")
        score -= 15
    elif gl > 10:
        warnings.append("ℹ️ Moderate glycemic load")
        score -= 5
    
    # Health-specific scoring
    if user_health.get("diabetes"):
        if totals["total_carbs"] > 45:
            score -= 20
            warnings.append("⚠️ Very high carbs for diabetes management")
        if totals["total_fiber"] < 8:
            score -= 10
            recommendations.append("Add high-fiber foods to slow glucose absorption")
    
    if user_health.get("hypertension"):
        recommendations.append("Choose low-sodium preparation methods")
    
    # Ensure score doesn't go below 0
    score = max(0, score)
    
    # Determine meal quality
    if score >= 80:
        quality = "Excellent"
    elif score >= 60:
        quality = "Good"
    elif score >= 40:
        quality = "Fair"
    else:
        quality = "Needs Improvement"
    
    return {
        "score": score,
        "quality": quality,
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
    
    # Calculate meal-level nutrition
    meal_totals = calculate_meal_totals(foods)
    
    # Get meal score and recommendations
    meal_analysis = get_meal_score(meal_totals, user_health)
    
    return {
        "detected_items": foods,
        "meal_summary": {
            **meal_totals,
            **meal_analysis
        }
    }


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
