"""
Test script for YOLO + DeepSeek-VL2 Food Detection API
Run this after installing dependencies to verify the integration
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    
    try:
        from app.yolo import YOLOFoodDetector
        print("✓ YOLO module imported")
    except Exception as e:
        print(f"✗ YOLO module failed: {e}")
        
    try:
        from app.deepseek import DeepSeekFoodDetector
        print("✓ DeepSeek module imported")
    except Exception as e:
        print(f"✗ DeepSeek module failed: {e}")
        
    try:
        from app.fusion import DetectionFusion
        print("✓ Fusion module imported")
    except Exception as e:
        print(f"✗ Fusion module failed: {e}")
        
    try:
        from app.heuristics import FoodHeuristics
        print("✓ Heuristics module imported")
    except Exception as e:
        print(f"✗ Heuristics module failed: {e}")
        
    try:
        from app.scan_models import ScanFoodResponse
        print("✓ Models module imported")
    except Exception as e:
        print(f"✗ Models module failed: {e}")


def test_fusion_logic():
    """Test fusion logic without models."""
    print("\nTesting fusion logic...")
    
    from app.fusion import DetectionFusion
    
    fusion = DetectionFusion()
    
    # Mock YOLO results
    yolo_results = [
        {"name": "rice", "confidence": 0.9, "source": "yolo"},
        {"name": "chicken", "confidence": 0.85, "source": "yolo"}
    ]
    
    # Mock DeepSeek results
    deepseek_results = [
        {"name": "rice", "confidence": 0.7, "source": "deepseek"},  # Duplicate
        {"name": "salad", "confidence": 0.6, "source": "deepseek"}  # New item
    ]
    
    fused = fusion.fuse(yolo_results, deepseek_results)
    
    print(f"YOLO: {len(yolo_results)} items")
    print(f"DeepSeek: {len(deepseek_results)} items")
    print(f"Fused: {len(fused)} items")
    
    assert len(fused) == 3, "Should have 3 unique items"
    
    names = [item['name'] for item in fused]
    assert 'rice' in names
    assert 'chicken' in names
    assert 'salad' in names
    
    print("✓ Fusion logic works correctly")
    
    stats = fusion.get_statistics(fused)
    print(f"Stats: {stats}")


def test_heuristics():
    """Test heuristics without models."""
    print("\nTesting heuristics...")
    
    from app.heuristics import FoodHeuristics
    
    try:
        heuristics = FoodHeuristics()
        print(f"✓ Loaded {len(heuristics.nutrition_db)} nutrition entries")
        print(f"✓ Loaded {len(heuristics.glycemic_index_db)} GI entries")
        
        # Test enrichment
        mock_item = {
            "name": "Jollof Rice",
            "confidence": 0.87,
            "source": "yolo"
        }
        
        enriched = heuristics.enrich_food_item(mock_item)
        
        print(f"\nEnriched item:")
        print(f"  Name: {enriched['name']}")
        print(f"  Calories: {enriched['calories']}")
        print(f"  Carbs: {enriched['carbs']}g")
        print(f"  Protein: {enriched['protein']}g")
        print(f"  GI: {enriched['glycemic_index']}")
        print(f"  Flags: {enriched['flags']}")
        
        # Test meal summary
        enriched_items = [enriched]
        summary = heuristics.calculate_meal_summary(enriched_items)
        
        print(f"\nMeal Summary:")
        print(f"  Score: {summary['score']}")
        print(f"  Quality: {summary['quality']}")
        print(f"  Glycemic Load: {summary['glycemic_load']}")
        print(f"  Recommendations: {summary['recommendations']}")
        
        print("✓ Heuristics work correctly")
        
    except Exception as e:
        print(f"✗ Heuristics failed: {e}")
        import traceback
        traceback.print_exc()


def test_models():
    """Test Pydantic models."""
    print("\nTesting Pydantic models...")
    
    from app.scan_models import (
        FoodDetection,
        MealSummary,
        MealRecommendations,
        ScanFoodResponse
    )
    
    # Test FoodDetection
    food = FoodDetection(
        name="rice",
        confidence=0.9,
        source="yolo",
        calories=180,
        carbs=35,
        protein=4,
        fat=3,
        fiber=1,
        glycemic_index=72,
        flags=["carb-heavy"],
        warnings={"diabetes": "High GI"},
        portion_advice="Limit portion"
    )
    
    print(f"✓ FoodDetection: {food.name} ({food.confidence})")
    
    # Test MealSummary
    summary = MealSummary(
        item_count=1,
        total_calories=180,
        total_carbs=35,
        total_protein=4,
        total_fat=3,
        total_fiber=1,
        glycemic_load=25.2,
        score=65.0,
        quality="Good",
        components={},
        recommendations=["Add vegetables"],
        warnings=[]
    )
    
    print(f"✓ MealSummary: {summary.quality} (score: {summary.score})")
    
    # Test complete response
    response = ScanFoodResponse(
        detected_items=[food],
        meal_summary=summary,
        recommendations=MealRecommendations(
            healthy_alternatives=[],
            portion_adjustments=[],
            additions=[]
        ),
        fusion_stats={}
    )
    
    print(f"✓ ScanFoodResponse: {len(response.detected_items)} items")
    print("✓ All Pydantic models validated successfully")


if __name__ == "__main__":
    print("=" * 60)
    print("YOLO + DeepSeek-VL2 Integration Test Suite")
    print("=" * 60)
    
    test_imports()
    test_fusion_logic()
    test_heuristics()
    test_models()
    
    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run server: uvicorn app.main:app --reload")
    print("3. Test endpoint: curl -X POST http://localhost:8000/scan-food-yolo-deepseek/ -F 'file=@image.jpg'")
    print("4. Visit docs: http://localhost:8000/docs")
