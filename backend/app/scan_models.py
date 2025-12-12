"""
Pydantic Models for Food Detection API
Response schemas for /scan-food endpoint
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FoodDetection(BaseModel):
    """Individual detected food item with enriched data."""
    
    name: str = Field(..., description="Name of detected food item")
    confidence: float = Field(..., description="Detection confidence (0-1)")
    source: str = Field(..., description="Detection source: 'yolo' or 'deepseek'")
    calories: float = Field(..., description="Estimated calories per serving")
    carbs: float = Field(..., description="Carbohydrates in grams")
    protein: float = Field(..., description="Protein in grams")
    fat: float = Field(..., description="Fat in grams")
    fiber: float = Field(..., description="Dietary fiber in grams")
    glycemic_index: Optional[int] = Field(None, description="Glycemic index (0-100)")
    flags: List[str] = Field(default_factory=list, description="Food characteristics (fried, carb-heavy, etc.)")
    warnings: Dict[str, str] = Field(default_factory=dict, description="Health condition warnings")
    portion_advice: str = Field(..., description="Portion size recommendations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "jollof rice",
                "confidence": 0.87,
                "source": "yolo",
                "calories": 180,
                "carbs": 35,
                "protein": 4,
                "fat": 3,
                "fiber": 1,
                "glycemic_index": 72,
                "flags": ["carb-heavy", "starchy"],
                "warnings": {
                    "diabetes": "High GI; portion control.",
                    "hypertension": "Watch salt/oil."
                },
                "portion_advice": "High GI - limit portion for blood sugar control"
            }
        }


class MealSummary(BaseModel):
    """Aggregated meal-level nutrition and scoring."""
    
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
    recommendations: List[str] = Field(default_factory=list, description="Meal improvement suggestions")
    warnings: List[str] = Field(default_factory=list, description="Health alerts")
    
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
                    "meal_diversity": 75,
                    "nutrient_completeness": 70,
                    "glycemic_load_score": 68,
                    "fiber_adequacy": 50,
                    "protein_adequacy": 85,
                    "fat_quality": 70,
                    "sodium_penalty": 75,
                    "diabetes_friendly": 65
                },
                "recommendations": [
                    "Increase fiber - add leafy greens or whole grains",
                    "Reduce carb-heavy items or add low-GI alternatives"
                ],
                "warnings": [
                    "⚠️ High glycemic load - monitor blood sugar"
                ]
            }
        }


class MealRecommendations(BaseModel):
    """Actionable meal improvement suggestions."""
    
    healthy_alternatives: List[str] = Field(
        default_factory=list,
        description="Substitute suggestions for unhealthy items"
    )
    portion_adjustments: List[str] = Field(
        default_factory=list,
        description="Portion sizing recommendations"
    )
    additions: List[str] = Field(
        default_factory=list,
        description="Suggested food additions for balance"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "healthy_alternatives": [
                    "Replace with boiled or boli (roasted) plantain (~40% fewer calories)",
                    "Use brown rice or quinoa (lower GI)"
                ],
                "portion_adjustments": [
                    "Reduce jollof rice portion by 30-40% (high GI)"
                ],
                "additions": [
                    "Add leafy greens (spinach, kale) for fiber and minerals",
                    "Add vegetable salad or steamed vegetables"
                ]
            }
        }


class ScanFoodResponse(BaseModel):
    """Complete response for /scan-food endpoint."""
    
    detected_items: List[FoodDetection] = Field(
        ...,
        description="Individual detected food items with enriched data"
    )
    meal_summary: MealSummary = Field(
        ...,
        description="Aggregated meal-level nutrition and scores"
    )
    recommendations: MealRecommendations = Field(
        ...,
        description="Actionable meal improvement suggestions"
    )
    fusion_stats: Dict[str, Any] = Field(
        default_factory=dict,
        description="Statistics about detection fusion (YOLO vs DeepSeek)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "detected_items": [
                    {
                        "name": "jollof rice",
                        "confidence": 0.87,
                        "source": "yolo",
                        "calories": 180,
                        "carbs": 35,
                        "protein": 4,
                        "fat": 3,
                        "fiber": 1,
                        "glycemic_index": 72,
                        "flags": ["carb-heavy", "starchy"],
                        "warnings": {"diabetes": "High GI; portion control."},
                        "portion_advice": "High GI - limit portion for blood sugar control"
                    }
                ],
                "meal_summary": {
                    "item_count": 1,
                    "total_calories": 180,
                    "total_carbs": 35,
                    "total_protein": 4,
                    "total_fat": 3,
                    "total_fiber": 1,
                    "glycemic_load": 25.2,
                    "score": 65.5,
                    "quality": "Good",
                    "components": {},
                    "recommendations": ["Add vegetables for fiber"],
                    "warnings": ["⚠️ High glycemic load - monitor blood sugar"]
                },
                "recommendations": {
                    "healthy_alternatives": [],
                    "portion_adjustments": ["Reduce jollof rice portion by 30-40% (high GI)"],
                    "additions": ["Add vegetable salad or steamed vegetables"]
                },
                "fusion_stats": {
                    "total_items": 1,
                    "yolo_items": 1,
                    "deepseek_items": 0,
                    "average_confidence": 0.87
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema."""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "No foods detected in image",
                "detail": "Both YOLO and DeepSeek returned empty results"
            }
        }
