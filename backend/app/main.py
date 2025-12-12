from ultralytics import YOLO
from transformers import AutoImageProcessor, AutoModelForImageClassification, pipeline
from fastapi import FastAPI, UploadFile, File, Form
from io import BytesIO
from PIL import Image
from pathlib import Path
import json
import os

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

# Classifier (nateraw/food) for fallback
HF_MODEL_PATH = BASE_DIR / "ml_models" / "classifiers" / "food_classifier"
_classifier_pipe = None
def get_classifier_pipe():
    global _classifier_pipe
    if _classifier_pipe is None:
        if not HF_MODEL_PATH.exists():
            raise FileNotFoundError(f"Classifier not found at {HF_MODEL_PATH}")
        processor = AutoImageProcessor.from_pretrained(str(HF_MODEL_PATH))
        model = AutoModelForImageClassification.from_pretrained(str(HF_MODEL_PATH))
        _classifier_pipe = pipeline("image-classification", model=model, device=0)
    return _classifier_pipe


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
    calories = nutrition_db.get(food_name, {}).get("calories")
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
        "glycemic_index": gi,
        "advice": advice
    }

def analyze_image(img: Image.Image, user_health: dict):
    results_list = []
    # Run YOLO first
    yolo_model = get_yolo_model()
    yolo_results = yolo_model.predict(img)
    for r in yolo_results:
        for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
            food_name = yolo_model.names[int(cls_id)]
            info = get_food_info(food_name, float(conf))
            info["source"] = "YOLO"
            # Apply personalized rules
            info["advice"] = personalize_advice(info, user_health)
            results_list.append(info)

    # 2️⃣ Run fallback classifier if YOLO fails
    if not results_list or max([f["confidence"] for f in results_list]) < 0.5:
        classifier = get_classifier_pipe()
        classifier_results = classifier(img)
        for res in classifier_results[:3]:  # top 3
            food_name = res["label"]
            conf = float(res["score"])
            info = get_food_info(food_name, conf)
            info["source"] = "Classifier"
            info["advice"] = personalize_advice(info, user_health)
            results_list.append(info)

    return results_list

def personalize_advice(food_info: dict, user_health: dict):
    advice = food_info.get("advice", "")
    # Example personalized rules
    if user_health.get("diabetes") and food_info.get("glycemic_index", 0) > 55:
        advice += " ⚠️ Limit intake due to diabetes"
    if user_health.get("hypertension") and food_info.get("name", "").lower() in ["salted meat", "processed food"]:
        advice += " ⚠️ High sodium – avoid for hypertension"
    if user_health.get("ulcer") and food_info.get("name", "").lower() in ["spicy stew", "fried food"]:
        advice += " ⚠️ May irritate ulcers"
    return advice

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
        "yolo_model_loaded": bool(_yolo_model is not None),
        "classifier_loaded": bool(_classifier_pipe is not None)
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
