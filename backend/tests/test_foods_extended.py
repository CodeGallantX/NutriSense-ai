import json
from pathlib import Path

DATA_PATH = Path(__file__).parent / "app" / "data" / "foods_extended.json"


def _gi_category(gi: int | float | None) -> str | None:
    if gi is None:
        return None
    if gi <= 55:
        return "low"
    if gi <= 69:
        return "medium"
    return "high"


def test_foods_extended_schema_and_gi_category():
    assert DATA_PATH.exists(), "foods_extended.json is missing"
    data = json.loads(DATA_PATH.read_text())
    assert isinstance(data, list), "foods_extended.json must be a list"
    assert len(data) >= 500, "foods_extended.json should contain at least 500 items"

    required_fields = {
        "name": str,
        "calories": (int, float),
        "carbs": (int, float),
        "protein": (int, float),
        "fat": (int, float),
        "fiber": (int, float),
        "glycemic_index": (int, float, type(None)),
        "GI_category": (str, type(None)),
        "suitable_for": list,
        "incompatible_with": list,
        "common_pairings": list,
    }
    allowed_suitable = {"type1", "type2", "healthy", "weight_loss"}
    allowed_gi_categories = {"low", "medium", "high", None}

    for idx, item in enumerate(data):
        for field, expected_type in required_fields.items():
            assert field in item, f"Missing field '{field}' at index {idx}"
            assert isinstance(item[field], expected_type), f"Field '{field}' has wrong type at index {idx}"

        gi = item["glycemic_index"]
        gi_cat = item["GI_category"]
        assert gi_cat in allowed_gi_categories, f"Invalid GI_category '{gi_cat}' at index {idx}"
        expected_cat = _gi_category(gi)
        if expected_cat is not None:
            assert gi_cat == expected_cat, f"GI_category mismatch at index {idx}: expected {expected_cat}, got {gi_cat}"

        # ensure suitable_for is a subset of allowed tags
        assert set(item["suitable_for"]).issubset(allowed_suitable), f"Unexpected suitable_for tags at index {idx}"

        # basic sanity: macros and fiber non-negative
        for macro in ("calories", "carbs", "protein", "fat", "fiber"):
            assert item[macro] >= 0, f"Negative value for '{macro}' at index {idx}"

        # lists contain strings
        for list_field in ("incompatible_with", "common_pairings"):
            assert all(isinstance(v, str) for v in item[list_field]), f"Non-string entries in '{list_field}' at index {idx}"


if __name__ == "__main__":  # allow quick manual run
    test_foods_extended_schema_and_gi_category()
    print("foods_extended.json validation passed")
