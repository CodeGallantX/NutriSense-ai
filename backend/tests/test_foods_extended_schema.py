import json
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parent / "app" / "data" / "foods_extended.json"


def _gi_category(gi: int | float | None) -> str | None:
    if gi is None:
        return None
    try:
        gi = float(gi)
    except Exception:
        return None
    if gi <= 55:
        return "low"
    if gi <= 69:
        return "medium"
    return "high"


def test_foods_extended_exists_and_has_minimum_items():
    assert DATA_PATH.exists(), f"Missing dataset at {DATA_PATH}"
    data = json.loads(DATA_PATH.read_text())
    assert isinstance(data, list), "Dataset must be a list of objects"
    assert len(data) >= 500, f"Expected at least 500 items, found {len(data)}"


def test_schema_and_values_are_valid():
    data = json.loads(DATA_PATH.read_text())
    required = {
        "name",
        "calories",
        "carbs",
        "protein",
        "fat",
        "fiber",
        "glycemic_index",
        "GI_category",
        "suitable_for",
        "incompatible_with",
        "common_pairings",
    }
    allowed_suitable = {"type1", "type2", "healthy", "weight_loss"}

    names_seen = set()
    for i, item in enumerate(data):
        missing = required - set(item.keys())
        assert not missing, f"Item {i} missing fields: {sorted(missing)}"

        # Name
        name = item["name"]
        assert isinstance(name, str) and name.strip(), f"Invalid name at index {i}"
        assert name.lower() not in names_seen, f"Duplicate name '{name}' at index {i}"
        names_seen.add(name.lower())

        # Numeric fields
        for fld in ("calories", "carbs", "protein", "fat", "fiber"):
            assert isinstance(item[fld], (int, float)), f"{fld} must be number for '{name}'"

        # GI and category alignment
        gi = item["glycemic_index"]
        assert gi is None or isinstance(gi, (int, float)), f"GI must be number or None for '{name}'"
        if gi is not None:
            assert 0 <= gi <= 100, f"GI out of range [0,100] for '{name}': {gi}"
        expected_cat = _gi_category(gi)
        if expected_cat is None:
            # If GI is None, category may be omitted or low by default; tolerate only None or 'low'
            assert item["GI_category"] in {None, "low"}, f"Unexpected GI_category for '{name}'"
        else:
            assert item["GI_category"] == expected_cat, (
                f"GI_category mismatch for '{name}': got {item['GI_category']}, expected {expected_cat}"
            )

        # Lists
        for arr_key in ("suitable_for", "incompatible_with", "common_pairings"):
            assert isinstance(item[arr_key], list), f"{arr_key} must be list for '{name}'"
            assert all(isinstance(x, str) and x.strip() for x in item[arr_key]), (
                f"{arr_key} must be list of non-empty strings for '{name}'"
            )

        # Suitability constraints for diabetes
        suitable = set(item["suitable_for"])
        assert suitable <= allowed_suitable, (
            f"suitable_for has invalid tags for '{name}': {sorted(suitable - allowed_suitable)}"
        )
