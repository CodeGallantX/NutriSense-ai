import json
from pathlib import Path
from typing import Dict, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def _load_json_or_empty(path: Path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {} if path.suffix == ".json" else []


def _normalize(name: str) -> str:
    return name.strip().lower()


NUTRITION_DB = _load_json_or_empty(DATA_DIR / "nutrition_db.json")
GI_DB = _load_json_or_empty(DATA_DIR / "glycemic_index.json")
FOOD_MAP = _load_json_or_empty(DATA_DIR / "local_food_map.json")

# Extended dataset (list of dicts) – used for fallback enrichment and autocomplete.
FOODS_EXTENDED = _load_json_or_empty(DATA_DIR / "foods_extended.json") or []
FOODS_EXT_INDEX: Dict[str, dict] = {_normalize(item.get("name", "")): item for item in FOODS_EXTENDED}


def _from_extended(food_name: str) -> Tuple[Dict, int | None, str | None, list, list, list]:
    """Return nutrition and GI data from extended dataset if available."""
    entry = FOODS_EXT_INDEX.get(_normalize(food_name))
    if not entry:
        return {}, None, None, [], [], []

    gi = entry.get("glycemic_index")
    gi_category = entry.get("GI_category")
    nutrition = {
        "calories": entry.get("calories", 0),
        "carbs": entry.get("carbs", 0),
        "protein": entry.get("protein", 0),
        "fat": entry.get("fat", 0),
        "fiber": entry.get("fiber", 0),
        "warnings": {},
        "flags": [],
    }
    return (
        nutrition,
        gi,
        gi_category,
        entry.get("suitable_for", []) or [],
        entry.get("incompatible_with", []) or [],
        entry.get("common_pairings", []) or [],
    )


def _get_food_data(food_name: str) -> Tuple[Dict, int | None, str | None, list, list, list]:
    """Retrieve nutrition and GI data prioritizing curated DB, then extended list."""
    nutrition = NUTRITION_DB.get(food_name, {})
    gi = GI_DB.get(food_name)
    gi_category = None
    suitable = []
    incompatible = []
    pairings = []

    if not nutrition or gi is None:
        ext_nutrition, ext_gi, ext_gi_cat, suitable, incompatible, pairings = _from_extended(food_name)
        if nutrition:
            # Merge extended macros if present, preserving warnings/flags from curated DB.
            nutrition = {**ext_nutrition, **nutrition}
        else:
            nutrition = ext_nutrition
        if gi is None:
            gi = ext_gi
        gi_category = ext_gi_cat

    return nutrition, gi, gi_category, suitable, incompatible, pairings


def analyze_food(yolo_detections):
    results = []

    for det in yolo_detections:
        cls_id = str(det["class"])
        food_name = FOOD_MAP.get(cls_id, "Unknown Food")

        nutrition, gi, gi_category, suitable, incompatible, pairings = _get_food_data(food_name)

        results.append({
            "food": food_name,
            "confidence": det["confidence"],
            "nutrition": nutrition,
            "glycemic_index": gi,
            "gi_category": gi_category,
            "suitable_for": suitable,
            "incompatible_with": incompatible,
            "common_pairings": pairings,
        })

    return results


def list_food_names():
    """Return a sorted list of known food names (curated + extended) for autocomplete."""
    names = set(NUTRITION_DB.keys())
    names.update(item.get("name", "") for item in FOODS_EXTENDED)
    return sorted(n for n in names if n)
