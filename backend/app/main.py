from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
from pathlib import Path
import json
import os
import numpy as np
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.services.classification_service import classify_food
import logging

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import new modules for YOLO + Mistral + Heuristics
from app.ml.yolo import YOLOFoodDetector
# TODO: Re-enable DeepSeek integration when needed
# from app.ml.deepseek import DeepSeekFoodDetector
from app.ml.mistral import MistralFoodValidator
from app.core.fusion import DetectionFusion
from app.core.heuristics import FoodHeuristics
from app.ml.scan_models import (
    ScanFoodResponse,
    FoodDetection as ScanFoodItem,
    MealSummary as ScanMealSummary,
    MealRecommendations as ScanMealRecommendations,
    ErrorResponse
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# --- Pydantic Models for Request/Response Schemas ---

class FoodDetection(BaseModel):
    name: str = Field(..., description="Name of detected food item")
    confidence: float = Field(..., description="Detection confidence (0-1)")
    calories: float | None = Field(None, description="Estimated calories per serving")
    carbs: float | None = Field(None, description="Carbohydrates in grams")
    protein: float | None = Field(None, description="Protein in grams")
    fat: float | None = Field(None, description="Fat in grams")
    fiber: float | None = Field(None, description="Dietary fiber in grams")
    glycemic_index: int | None = Field(None, description="Glycemic index (0-100)")
    flags: List[str] = Field(default_factory=list, description="Food characteristics (fried, spicy, carb-heavy, etc.)")
    source: str = Field(..., description="Detection source: YOLO, YOLO-SEG, Classifier, or Heuristic")
    advice: str = Field(..., description="Personalized nutrition advice based on health conditions")
    health_warnings: Dict[str, str] = Field(default_factory=dict, description="Condition-specific warnings")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jollof Rice",
                "confidence": 0.87,
                "calories": 180,
                "carbs": 35,
                "protein": 4,
                "fat": 3,
                "fiber": 1,
                "glycemic_index": 72,
                "flags": ["carb-heavy", "starchy"],
                "source": "YOLO",
                "advice": "High GI – minimize for diabetes ⚠️ High GI - limit intake for diabetes",
                "health_warnings": {"diabetes": "High GI; consider portion control"}
            }
        }


class MealComponent(BaseModel):
    meal_diversity: float = Field(..., description="Score 0-100: variety of foods detected")
    nutrient_completeness: float = Field(..., description="Score 0-100: balance of macros and fiber")
    glycemic_load_score: float = Field(..., description="Score 0-100: based on total glycemic load")
    fiber_adequacy: float = Field(..., description="Score 0-100: adequacy relative to recommendations")
    protein_adequacy: float = Field(..., description="Score 0-100: adequacy relative to recommendations")
    fat_quality: float = Field(..., description="Score 0-100: presence of fried/fatty foods penalty")
    sodium_penalty: float = Field(..., description="Score 0-100: salt/processed food penalty")
    diabetes_friendly: float = Field(..., description="Score 0-100: suitability for diabetics")


class MealSummary(BaseModel):
    item_count: int = Field(..., description="Number of distinct food items detected")
    total_calories: float = Field(..., description="Total estimated calories")
    total_carbs: float = Field(..., description="Total carbohydrates in grams")
    total_protein: float = Field(..., description="Total protein in grams")
    total_fat: float = Field(..., description="Total fat in grams")
    total_fiber: float = Field(..., description="Total dietary fiber in grams")
    glycemic_load: float = Field(..., description="Estimated total glycemic load of the meal")
    score: float = Field(..., description="Composite meal health score (0-100)")
    quality: str = Field(..., description="Quality: Excellent/Good/Fair/Risky/Dangerous")
    components: Dict[str, float] = Field(..., description="Breakdown of component scores")
    recommendations: List[str] = Field(default_factory=list, description="Suggestions for meal improvement")
    warnings: List[str] = Field(default_factory=list, description="Health alerts based on composition")
    
    class Config:
        json_schema_extra = {
            "example": {
                "item_count": 3,
                "total_calories": 650,
                "total_carbs": 85,
                "total_protein": 35,
                "total_fat": 18,
                "total_fiber": 4,
                "glycemic_load": 58,
                "score": 72.3,
                "quality": "Good",
                "components": {
                    "meal_diversity": 80,
                    "nutrient_completeness": 75,
                    "glycemic_load_score": 68,
                    "fiber_adequacy": 60,
                    "protein_adequacy": 85,
                    "fat_quality": 70,
                    "sodium_penalty": 65,
                    "diabetes_friendly": 72
                },
                "recommendations": ["Add more vegetables for fiber", "Consider smaller portion of rice"],
                "warnings": ["High glycemic load - monitor for diabetes"]
            }
        }


class MealRecommendations(BaseModel):
    healthy_alternatives: List[str] = Field(default_factory=list, description="Substitute suggestions")
    portion_adjustments: List[str] = Field(default_factory=list, description="Portion sizing recommendations")
    additions: List[str] = Field(default_factory=list, description="Suggested food additions for balance")

    class Config:
        json_schema_extra = {
            "example": {
                "healthy_alternatives": [
                    "Replace fried plantain with boiled plantain (~40% fewer calories)",
                    "Use brown rice instead of white rice (lower GI)"
                ],
                "portion_adjustments": [
                    "Reduce Jollof Rice to 1 cup (high GI impact)",
                    "Increase protein portion to 200g"
                ],
                "additions": [
                    "Add cucumber or tomato salad for fiber",
                    "Include leafy greens (spinach) for minerals"
                ]
            }
        }

class MealAnalysisResponse(BaseModel):
    detected_items: List[FoodDetection] = Field(..., description="Individual detected food items")
    meal_summary: MealSummary = Field(..., description="Aggregated meal-level nutrition and scores")
    recommendations: MealRecommendations = Field(..., description="Actionable meal improvement suggestions")

    class Config:
        json_schema_extra = {
            "example": {
                "detected_items": [
                    {
                        "name": "Jollof Rice",
                        "confidence": 0.87,
                        "calories": 180,
                        "carbs": 35,
                        "protein": 4,
                        "fat": 3,
                        "fiber": 1,
                        "glycemic_index": 72,
                        "flags": ["carb-heavy", "starchy"],
                        "source": "YOLO",
                        "advice": "High GI - limit intake for diabetes",
                        "health_warnings": {"diabetes": "High GI; consider portion control"}
                    }
                ],
                "meal_summary": {
                    "item_count": 1,
                    "total_calories": 180,
                    "total_carbs": 35,
                    "total_protein": 4,
                    "total_fat": 3,
                    "total_fiber": 1,
                    "glycemic_load": 25,
                    "score": 62.0,
                    "quality": "Fair",
                    "components": {},
                    "recommendations": ["Add protein and vegetables"],
                    "warnings": []
                },
                "recommendations": {
                    "healthy_alternatives": [],
                    "portion_adjustments": [],
                    "additions": ["Add grilled chicken (protein)", "Add salad (fiber)"]
                }
            }
        }

class DetectionCorrection(BaseModel):
    original: str = Field(..., description="Original food name detected by model")
    actual: str = Field(..., description="Correct food name provided by user")


class HealthStatus(BaseModel):
    status: str = Field(..., description="API status")
    yolo_model_loaded: bool = Field(..., description="YOLO detection model availability")


# --- FastAPI Application Setup ---

app = FastAPI(
    title="NutriSense AI",
    description="🍽️ **Comprehensive Food Nutrition Analysis API**\n\n"
               "Upload a meal image to get:\n\n"
               "✅ **Detected Foods** - Individual items with confidence scores\n"
               "✅ **Per-Item Nutrition** - Calories, macros, fiber, glycemic index\n"
               "✅ **Meal-Level Analysis** - Aggregated nutrition and health scores\n"
               "✅ **Health-Specific Warnings** - Diabetes, ulcer, hypertension, acid reflux alerts\n"
               "✅ **Personalized Recommendations** - Meal alternatives, portions, additions\n\n"
               "**Key Technologies:**\n"
               "• **YOLOv8 Detection** - Fast, accurate food item detection\n"
               "• **YOLOv8 Segmentation** (optional) - Pixel-perfect food separation\n"
               "• **HuggingFace Classifier** - Fallback for ambiguous items\n"
               "• **Multi-Component Scoring** - Diversity, completeness, GL, fiber, protein, fat quality, sodium\n"
               "• **Hierarchical Analysis** - Primary detection + hierarchical classification + heuristics\n\n"
               "**Supported Conditions:**\n"
               "Diabetes | Hypertension | Ulcers | Acid Reflux | Weight Management",
    version="1.0",
    contact={
        "name": "NutriSense AI",
        "url": "https://nutri-sense-ai-eight.vercel.app/dashboard",
        # "url": "https://github.com/meet-tola/NutriSense-ai",
    },
    openapi_tags=[
        {
            "name": "Health",
            "description": "API status and health checks"
        },
        {
            "name": "Food Detection",
            "description": "Detect and analyze food items from images"
        },
        {
            "name": "User Corrections",
            "description": "Refine detected items and recalculate nutrition"
        }
    ]
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           
        "http://localhost:8000",           
        "https://nutri-sense-ai-eight.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# YOLO models (original implementation)
YOLO_PATH = BASE_DIR / "ml_models" / "yolo" / "best.onnx"
YOLO_SEG_PATH = BASE_DIR / "ml_models" / "yolo" / "best-seg.onnx"
_yolo_model = None
_yolo_seg_model = None

# New integrated models (YOLO + Mistral + Heuristics)
_yolo_detector = None
# TODO: Re-enable DeepSeek integration when needed
# _deepseek_detector = None
_mistral_validator = None
_fusion_engine = None
_heuristics_engine = None

def get_yolo_detector():
    """Get or initialize YOLO food detector for /scan-food endpoint."""
    global _yolo_detector
    if _yolo_detector is None:
        try:
            logger.info("Initializing YOLO detector for /scan-food...")
            _yolo_detector = YOLOFoodDetector()
            logger.info("YOLO detector initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize YOLO detector: {e}")
            raise
    return _yolo_detector

# Preload models on startup for Render stability
@app.on_event("startup")
def preload_models():
    try:
        logger.info("Startup: Preloading YOLO model...")
        get_yolo_detector()
        logger.info("Startup: Models ready")
    except Exception as e:
        logger.error(f"Startup: Model preload failed: {e}")

# TODO: Re-enable DeepSeek integration when needed
# def get_deepseek_detector():
#     """Get or initialize DeepSeek-VL2 detector for /scan-food endpoint."""
#     global _deepseek_detector
#     if _deepseek_detector is None:
#         try:
#             logger.info("Initializing DeepSeek-VL2 detector...")
#             _deepseek_detector = DeepSeekFoodDetector()
#             logger.info("DeepSeek-VL2 detector initialized successfully")
#         except Exception as e:
#             logger.error(f"Failed to initialize DeepSeek detector: {e}")
#             # Don't raise - DeepSeek is optional
#             _deepseek_detector = None
#     return _deepseek_detector

def get_mistral_validator():
    """Get or initialize Mistral food validator."""
    global _mistral_validator
    if _mistral_validator is None:
        try:
            logger.info("Initializing Mistral validator...")
            _mistral_validator = MistralFoodValidator()
            logger.info("Mistral validator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Mistral validator: {e}")
            # Don't raise - Mistral is optional
            _mistral_validator = None
    return _mistral_validator

def get_fusion_engine():
    """Get or initialize fusion engine."""
    global _fusion_engine
    if _fusion_engine is None:
        _fusion_engine = DetectionFusion()
    return _fusion_engine

def get_heuristics_engine():
    """Get or initialize heuristics engine."""
    global _heuristics_engine
    if _heuristics_engine is None:
        try:
            logger.info("Initializing heuristics engine...")
            _heuristics_engine = FoodHeuristics()
            logger.info("Heuristics engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize heuristics engine: {e}")
            raise
    return _heuristics_engine

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
FOODS_EXT_PATH = BASE_DIR / "data" / "foods_extended.json"

def _load_json_or_empty(path: Path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {} if path.suffix == ".json" else []


def _normalize(name: str) -> str:
    return name.strip().lower()


nutrition_db = _load_json_or_empty(NUTRITION_PATH)
gi_db = _load_json_or_empty(GI_PATH)
foods_extended = _load_json_or_empty(FOODS_EXT_PATH) or []
foods_extended_index = {_normalize(item.get("name", "")): item for item in foods_extended}


def _from_extended(food_name: str):
    entry = foods_extended_index.get(_normalize(food_name))
    if not entry:
        return {}, None, None, []

    nutrition = {
        "calories": entry.get("calories", 0),
        "carbs": entry.get("carbs", 0),
        "protein": entry.get("protein", 0),
        "fat": entry.get("fat", 0),
        "fiber": entry.get("fiber", 0),
        "warnings": {},
        "flags": [],
    }
    return nutrition, entry.get("glycemic_index"), entry.get("GI_category"), entry.get("suitable_for", [])


def get_food_info(food_name: str, confidence: float):
    nutrition = nutrition_db.get(food_name, {})
    gi = gi_db.get(food_name)
    gi_category = None
    suitable_for = []

    if not nutrition or gi is None:
        ext_nutrition, ext_gi, gi_category, suitable_for = _from_extended(food_name)
        if nutrition:
            nutrition = {**ext_nutrition, **nutrition}
        else:
            nutrition = ext_nutrition
        if gi is None:
            gi = ext_gi

    calories = nutrition.get("calories")
    carbs = nutrition.get("carbs")
    protein = nutrition.get("protein")
    fat = nutrition.get("fat")
    fiber = nutrition.get("fiber")
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
        "gi_category": gi_category,
        "suitable_for": suitable_for,
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
                
                # Filter: drop classifier items below 0.3 confidence
                if conf_val < 0.3:
                    continue
                
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
        base.update({
            "confidence": 0.3,
            "source": "Heuristic",
            "advice": "Add protein side for balance",
            "flags": ["protein-side"]
        })
        additions.append(base)

    # If fiber is very low, add estimated vegetables
    if totals["total_fiber"] < 5:
        base = MEAL_TEMPLATES["low_fiber"].copy()
        base.update({
            "confidence": 0.3,
            "source": "Heuristic",
            "advice": "Add vegetables to boost fiber",
            "flags": ["vegetable", "fiber-rich"]
        })
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
@app.get("/", tags=["Health"], summary="API Status", response_model=dict)
def root():
    """Get API information and available endpoints."""
    return {
        "message": "NutriSense AI - Food Nutrition Analysis API",
        "version": "2.0",
        "endpoints": {
            "documentation": [
                "/docs (Swagger UI)",
                "/redoc (ReDoc)"
            ],
            "health": ["/health"],
            "food_analysis": [
                "/scan-food/ (basic analysis)",
                "/analyze-meal (flagship endpoint with full recommendations)"
            ],
            "user_interaction": [
                "/confirm-detections/ (refine detected items)"
            ]
        }
    }


@app.get("/health", tags=["Health"], summary="Health Check", response_model=HealthStatus)
def health():
    """
    Check API health status and model availability.
    
    Returns:
    - **status**: API operational status
    - **yolo_model_loaded**: Whether YOLO detection model is ready
    """
    return HealthStatus(
        status="ok",
        yolo_model_loaded=bool(_yolo_model is not None)
    )


# Alias with trailing slash to avoid redirects
@app.get("/health/", tags=["Health"], include_in_schema=False)
def health_with_slash():
    return health()


# Disabled Deepseek; using Mistral API key. Re-enable DeepSeek endpoint when needed
# @app.post(
#     "/scan-food-yolo-deepseek/",
#     tags=["Food Detection"],
#     summary="Advanced Food Detection (YOLO + DeepSeek-VL2)",
#     response_model=ScanFoodResponse,
#     responses={
#         200: {"description": "Successful food detection and analysis using YOLO + DeepSeek fusion"},
#         400: {"description": "Invalid image format"},
#         404: {"description": "No foods detected in image"},
#         500: {"description": "Server error during detection or analysis"}
#     }
# )
# async def scan_food_yolo_deepseek(
#     file: UploadFile = File(..., description="Food image file (JPEG, PNG, etc.)")
# ):
#     """DeepSeek endpoint - temporarily disabled"""
#     pass

@app.post(
    "/scan-food-yolo-mistral/",
    tags=["Food Detection"],
    summary="Advanced Food Detection (YOLO + Mistral AI)",
    responses={
        200: {"description": "Successful food detection and analysis using YOLO + Mistral fusion"},
        400: {"description": "Invalid image format"},
        404: {"description": "No foods detected in image"},
        500: {"description": "Server error during detection or analysis"}
    }
)
async def scan_food_yolo_mistral(
    file: UploadFile = File(..., description="Food image file (JPEG, PNG, etc.)")
):
    """
    **Advanced Food Detection using YOLO + Mistral AI with Heuristics**
    
    This endpoint implements the fusion strategy:
    - **YOLO** acts as the precise anchor (trusted results)
    - **Mistral AI** validates and extends YOLO detections (no hallucinations)
    - **Heuristics** enhance with nutrition, flags, glycemic info
    
    **Detection Strategy:**
    1. Run YOLO detection (high precision, trusted anchor)
    2. Validate with Mistral AI (confirms YOLO items, adds visible missed foods)
    3. Fuse results: For duplicates, keep higher confidence; add unique items >= 0.3 confidence
    4. Apply heuristics for nutrition data with defensive defaults
    5. Calculate meal summary and recommendations
    
    **Input:**
    - **file**: Image of a meal or food items
    
    **Output:**
    ```json
    {
      "detected_items": [
        {
          "name": "jollof rice",
          "confidence": 0.87,
          "source": "YOLO",
          "calories": 180,
          "carbs": 35,
          "protein": 4,
          "fat": 3,
          "fiber": 1,
          "glycemic_index": 72,
          "flags": ["carb-heavy", "starchy"],
          "warnings": {...},
          "portion_advice": "High GI - limit portion"
        }
      ],
      "meal_summary": {
        "item_count": 3,
        "total_calories": 650,
        "glycemic_load": 58,
        "score": 72.3,
        "quality": "Good",
        "recommendations": [...],
        "warnings": [...]
      },
      "recommendations": {
        "healthy_alternatives": [...],
        "portion_adjustments": [...],
        "additions": [...]
      },
      "fusion_stats": {
        "total_items": 3,
        "yolo_items": 2,
        "llm_items": 1
      }
    }
    ```
    
    **Benefits:**
    - Deterministic (no hallucinations - Mistral only validates/extends)
    - YOLO precision + Mistral validation
    - Rich nutrition data and recommendations
    - Graceful fallback to YOLO-only if Mistral fails
    """
    try:
        # Load and validate image
        try:
            image_bytes = await file.read()
            image = Image.open(BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            logger.info(f"Processing image: {image.size}, mode: {image.mode}")
            
        except Exception as e:
            logger.error(f"Invalid image format: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
        # Step 1: YOLO Detection
        logger.info("Step 1: Running YOLO detection...")
        yolo_detector = get_yolo_detector()
        # Slightly lower confidence to improve recall on challenging images
        yolo_results = yolo_detector.detect_foods(image, confidence_threshold=0.20, imgsz=640)
        logger.info(f"YOLO detected {len(yolo_results)} items")
        
        # Step 2: Mistral Validation (optional - graceful fallback)
        mistral_results = []
        try:
            logger.info("Step 2: Running Mistral validation...")
            mistral_validator = get_mistral_validator()
            if mistral_validator and mistral_validator.api_key:
                mistral_results = mistral_validator.validate_detections(
                    image, 
                    yolo_results, 
                    confidence_threshold=0.3
                )
                logger.info(f"Mistral validated/extended: {len(mistral_results)} items")
            else:
                logger.warning("Mistral validator not available (no API key), using YOLO only")
        except Exception as e:
            logger.warning(f"Mistral validation failed, continuing with YOLO only: {e}")
            if deepseek_detector:
                deepseek_results = deepseek_detector.detect_foods(image, confidence_threshold=0.3)
                logger.info(f"DeepSeek detected {len(deepseek_results)} items")
            else:
                logger.warning("DeepSeek detector not available, using YOLO only")
        except Exception as e:
            logger.warning(f"DeepSeek detection failed, continuing with YOLO only: {e}")
        
        # Step 3: Fusion
        logger.info("Step 3: Fusing detection results...")
        fusion_engine = get_fusion_engine()
        fused_results = fusion_engine.fuse(yolo_results, mistral_results)
        
        if not fused_results:
            logger.warning("No foods detected via YOLO+Mistral. Running server-side fallbacks...")
            # Fallback 1: Legacy YOLO-only pipeline
            try:
                legacy_yolo_results = yolo_detector.detect_foods(image, confidence_threshold=0.25, imgsz=640)
                fusion_engine = get_fusion_engine()
                fused_results = fusion_engine.fuse(legacy_yolo_results, [])
                logger.info(f"Legacy fallback fused items: {len(fused_results)}")
            except Exception as e:
                logger.warning(f"Legacy fallback failed: {e}")
                fused_results = []
            
            # Fallback 2: Flagship comprehensive analysis
            flagship_result = None
            try:
                heuristics_engine = get_heuristics_engine()
                # Reuse flagship functions if available
                from app.core.heuristics import analyze_image, apply_missing_ingredient_heuristics, build_meal_analysis
                foods_flagship = analyze_image(image, {
                    "diabetes": False,
                    "hypertension": False,
                    "ulcer": False,
                    "weight_loss": False,
                    "acid_reflux": False,
                })
                foods_flagship = apply_missing_ingredient_heuristics(foods_flagship)
                flagship_result = build_meal_analysis(foods_flagship, {
                    "diabetes": False,
                    "hypertension": False,
                    "ulcer": False,
                    "weight_loss": False,
                    "acid_reflux": False,
                })
                logger.info("Flagship fallback analysis completed")
            except Exception as e:
                logger.warning(f"Flagship fallback failed: {e}")
                flagship_result = None
            
            if not fused_results and not flagship_result:
                raise HTTPException(
                    status_code=404,
                    detail="No foods detected in image. Please try a clearer image with visible food items."
                )
        
        # Get fusion statistics
        fusion_stats = fusion_engine.get_statistics(fused_results)
        logger.info(f"Fusion complete: {fusion_stats}")
        
        # Step 4: Apply Heuristics
        logger.info("Step 4: Applying heuristics and enriching data...")
        heuristics_engine = get_heuristics_engine()
        
        enriched_items = []
        for item in fused_results:
            enriched = heuristics_engine.enrich_food_item(item)
            enriched_items.append(enriched)
        
        # Step 5: Calculate Meal Summary
        logger.info("Step 5: Calculating meal summary...")
        meal_summary = heuristics_engine.calculate_meal_summary(enriched_items)
        
        # Step 6: Generate Recommendations
        logger.info("Step 6: Generating recommendations...")
        recommendations = heuristics_engine.generate_meal_recommendations(
            enriched_items,
            meal_summary
        )
        
        # Build response (include flagship fallback if present)
        response = {
            "detected_items": [ScanFoodItem(**item).model_dump() for item in enriched_items],
            "meal_summary": ScanMealSummary(**meal_summary).model_dump(),
            "recommendations": ScanMealRecommendations(**recommendations).model_dump(),
            "fusion_stats": fusion_stats,
            "status": "success",
        }
        if 'flagship_result' in locals() and flagship_result:
            response["flagship"] = flagship_result
        logger.info("Food detection complete!")
        return response
        
    except HTTPException as e:
        logger.error(f"HTTP error during food detection: {e}")
        return {"detected_items": [], "meal_summary": {}, "recommendations": {}, "status": "error", "message": str(e.detail) if hasattr(e, 'detail') else str(e)}
    except Exception as e:
        logger.error(f"Unexpected error during food detection: {e}", exc_info=True)
        return {"detected_items": [], "meal_summary": {}, "recommendations": {}, "status": "error", "message": str(e)}


@app.post(
    "/scan-food/",
    tags=["Food Detection"],
    summary="Basic Food Analysis (Legacy)",
    responses={
        200: {"description": "Successful meal analysis with nutrition and recommendations"},
        400: {"description": "Invalid image format or request"},
        500: {"description": "Server error during detection or analysis"}
    }
)
async def scan_food(
    file: UploadFile = File(..., description="Food image file (JPEG, PNG, etc.)"),
    diabetes: bool = Form(False, description="User has diabetes"),
    hypertension: bool = Form(False, description="User has hypertension"),
    ulcer: bool = Form(False, description="User has ulcers"),
    weight_loss: bool = Form(False, description="User is managing weight loss")
):
    """
    Analyze a food image and provide comprehensive nutrition analysis.
    
    **Input:**
    - **file**: Image of a meal or food (multipart/form-data)
    - **diabetes**: Check for high-GI and high-carb warnings
    - **hypertension**: Flag high-sodium foods
    - **ulcer**: Alert on irritating foods (spicy, fatty)
    - **weight_loss**: Flag high-calorie items
    
    **Output:**
    Returns `MealAnalysisResponse` containing:
    - **detected_items**: Each food with nutrition facts and per-food advice
    - **meal_summary**: Aggregated totals, composite score (0-100), quality rating (Excellent/Good/Fair/Risky/Dangerous)
    - **recommendations**: Healthy alternatives, portion adjustments, and suggested additions
    
    **Example Response:**
    ```json
    {
      "detected_items": [
        {
          "name": "Jollof Rice",
          "confidence": 0.87,
          "calories": 180,
          "carbs": 35,
          "protein": 4,
          "fiber": 1,
          "glycemic_index": 72,
          "flags": ["carb-heavy", "starchy"],
          "source": "YOLO"
        }
      ],
      "meal_summary": {
        "total_calories": 350,
        "score": 68.5,
        "quality": "Fair",
        "recommendations": ["Add more protein", "Add vegetables for fiber"]
      },
      "recommendations": {
        "healthy_alternatives": ["Swap fried chicken -> grilled"],
        "portion_adjustments": ["Reduce high-GI carbs"]
      }
    }
    ```
    """
    user_health = {
        "diabetes": diabetes, 
        "hypertension": hypertension, 
        "ulcer": ulcer,
        "weight_loss": weight_loss
    }
    
    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        logger.info(f"Legacy /scan-food: image {image.size} mode {image.mode}")

        # Use new pipeline but keep legacy route
        yolo_detector = get_yolo_detector()
        yolo_results = yolo_detector.detect_foods(image, confidence_threshold=0.25, imgsz=640)

        fusion_engine = get_fusion_engine()
        fused_results = fusion_engine.fuse(yolo_results, [])

        heuristics_engine = get_heuristics_engine()
        enriched_items = [heuristics_engine.enrich_food_item(item) for item in fused_results]
        meal_summary = heuristics_engine.calculate_meal_summary(enriched_items)
        recommendations = heuristics_engine.generate_meal_recommendations(enriched_items, meal_summary)

        return {
            "detected_items": enriched_items,
            "meal_summary": meal_summary,
            "recommendations": recommendations,
            "status": "success",
        }
    except Exception as e:
        logger.error(f"Legacy /scan-food error: {e}", exc_info=True)
        return {"detected_items": [], "meal_summary": {}, "recommendations": {}, "status": "error", "message": str(e)}


@app.post(
    "/analyze-meal",
    tags=["Food Detection"],
    summary="Flagship Meal Analysis (Comprehensive)",
    responses={
        200: {"description": "Comprehensive meal analysis with all health conditions"},
        400: {"description": "Invalid image or request parameters"},
        500: {"description": "Detection or analysis error"}
    }
)
async def analyze_meal(
    file: UploadFile = File(..., description="Food image file (JPEG, PNG, etc.)"),
    diabetes: bool = Form(False, description="User has diabetes"),
    hypertension: bool = Form(False, description="User has hypertension"),
    ulcer: bool = Form(False, description="User has ulcers"),
    weight_loss: bool = Form(False, description="User is managing weight loss"),
    acid_reflux: bool = Form(False, description="User has acid reflux (GERD)")
):
    """
    **Flagship endpoint** - Comprehensive meal analysis with all health conditions.
    
    This is the recommended endpoint for complete nutritional and health analysis.
    
    **Input:**
    - **file**: High-quality food image for best detection
    - **diabetes**: GI and carb warnings for blood sugar management
    - **hypertension**: Sodium and processed food alerts
    - **ulcer**: Irritating food warnings (spicy, fried, acidic)
    - **weight_loss**: Calorie and macro density alerts
    - **acid_reflux**: Trigger foods (spicy, fatty, acidic)
    
    **Detection Flow:**
    1. Primary: YOLOv8 detection (or YOLOv8-seg if available for segmentation)
    2. Fallback: HuggingFace classifier if confidence is low
    3. Heuristic: Missing ingredient estimation (protein sides, vegetables)
    
    **Output - MealAnalysisResponse:**
    - **detected_items**: Up to 5 foods (sorted by confidence) with:
      - Nutrition: calories, carbs, protein, fat, fiber
      - Health: glycemic index, flags (fried/spicy/etc), personalized advice
    - **meal_summary**: Composite meal health score (0-100) with:
      - Component scores (diversity, completeness, GL, fiber, protein, fat, sodium, diabetes-friendly)
      - Quality rating: Excellent (85+) | Good (70-84) | Fair (50-69) | Risky (30-49) | Dangerous (<30)
    - **recommendations**: Actionable suggestions:
      - Healthy alternatives (swap fried for grilled, etc.)
      - Portion adjustments (reduce high-GI carbs)
      - Additions (add protein, fiber)
    
    **Use Cases:**
    - 📸 Food logging for health tracking apps
    - 🏥 Personalized meal planning for diabetics/hypertensives
    - 💪 Fitness and nutrition coaching
    - 🤖 Chatbot integration for meal recommendations
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


@app.post(
    "/confirm-detections/",
    tags=["User Corrections"],
    summary="Refine Detections",
    response_model=MealAnalysisResponse,
    responses={
        200: {"description": "Corrected nutrition analysis"},
        400: {"description": "Invalid correction format"},
        500: {"description": "Analysis error after correction"}
    }
)
async def confirm_detections(
    detected_items: List[Dict[str, Any]],
    corrections: List[DetectionCorrection]
):
    """
    Apply user-provided corrections to detected items and recompute nutrition.
    
    **Purpose:** Allow users to refine model predictions if they're inaccurate.
    
    **Input:**
    - **detected_items**: Original detection results from /analyze-meal or /scan-food/
    - **corrections**: List of `{"original": "detected_name", "actual": "correct_name"}` entries
    
    **Example Request:**
    ```json
    {
      "detected_items": [...],
      "corrections": [
        {"original": "Jollof Rice", "actual": "Fried Rice"},
        {"original": "Steamed Fish", "actual": "Grilled Tilapia"}
      ]
    }
    ```
    
    **Output:** Updated `MealAnalysisResponse` with corrected nutrition and scores.
    
    **Workflow:**
    1. Send detection results and user corrections
    2. API remaps food names and recalculates nutrition
    3. Meal score and recommendations are updated
    4. Use for iterative refinement in interactive UI
    """
    correction_map = {
        c.get("original"): c.get("actual") 
        for c in corrections 
        if isinstance(c, dict) and c.get("original") and c.get("actual")
    }
    updated_items = []
    for item in detected_items:
        name = item.get("name")
        new_name = correction_map.get(name, name)
        confidence = item.get("confidence", 0.5)
        info = get_food_info(new_name, confidence)
        info = _apply_flag_heuristics(info)
        info["source"] = f"Corrected:{item.get('source','user')}"
        updated_items.append(info)

    meal_totals = calculate_meal_totals(updated_items)
    meal_analysis = get_meal_score(updated_items, meal_totals, {})
    recs = build_recommendations(updated_items, meal_totals)
    return {
        "detected_items": updated_items,
        "meal_summary": {
            **meal_totals,
            **meal_analysis
        },
        "recommendations": recs
    }
