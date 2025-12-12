import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def _load_json_or_empty(path: Path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

NUTRITION_DB = _load_json_or_empty(DATA_DIR / "nutrition_db.json")
GI_DB = _load_json_or_empty(DATA_DIR / "glycemic_index.json")
FOOD_MAP = _load_json_or_empty(DATA_DIR / "local_food_map.json")

def analyze_food(yolo_detections):
    results = []

    for det in yolo_detections:
        cls_id = str(det["class"])
        food_name = FOOD_MAP.get(cls_id, "Unknown Food")

        nutrition = NUTRITION_DB.get(food_name, {})
        gi = GI_DB.get(food_name, None)

        results.append({
            "food": food_name,
            "confidence": det["confidence"],
            "nutrition": nutrition,
            "glycemic_index": gi
        })
    
    return results
