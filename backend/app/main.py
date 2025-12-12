from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, Form
from io import BytesIO
from PIL import Image
from pathlib import Path
import json
import os
from app.services.classification_service import classify_food

app = FastAPI(title="NutriSense API", version="1.0")

BASE_DIR = Path(__file__).resolve().parent

# YOLO Model for Chownet
YOLO_PATH = BASE_DIR / "ml_models" / "yolo" / "best.onnx"
_yolo_model = None
def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        if not YOLO_PATH.exists():
            raise FileNotFoundError(f"YOLO model not found at {YOLO_PATH}")
        _yolo_model = YOLO(str(YOLO_PATH))
    return _yolo_model

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

def analyze_image(img: Image.Image, user_health: dict):
    results_dict = {}  # Use dict to deduplicate by food name
    
    # 1️⃣ Run YOLO first
    yolo_model = get_yolo_model()
    yolo_results = yolo_model.predict(img)
    for r in yolo_results:
        for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
            food_name = yolo_model.names[int(cls_id)]
            conf_val = float(conf)
            info = get_food_info(food_name, conf_val)
            info["source"] = "YOLO"
            info["advice"] = personalize_advice(info, user_health)
            
            # Add or merge: keep higher confidence
            if food_name not in results_dict or conf_val > results_dict[food_name]["confidence"]:
                results_dict[food_name] = info

    # 2️⃣ Run fallback classifier if YOLO fails or low confidence
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
                
                # Only add if not already detected by YOLO or if classifier has higher confidence
                if food_name not in results_dict or conf_val > results_dict[food_name]["confidence"]:
                    info = get_food_info(food_name, conf_val)
                    info["source"] = "Classifier" if food_name not in results_dict else "YOLO+Classifier"
                    info["advice"] = personalize_advice(info, user_health)
                    results_dict[food_name] = info
        except Exception as e:
            # Classifier is optional, continue with YOLO results only
            pass

    # Convert to list, sort by confidence (descending), limit to top 5
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
    ulcer: bool = Form(False)
):
    user_health = {"diabetes": diabetes, "hypertension": hypertension, "ulcer": ulcer}
    img = Image.open(BytesIO(await file.read()))
    analysis = analyze_image(img, user_health)
    return {"foods": analysis}
