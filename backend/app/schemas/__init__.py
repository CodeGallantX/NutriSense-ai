# Original models
from .analysis_response import *
from .food_item import *

# New scan models (YOLO + DeepSeek integration)
from ..scan_models import (
	ScanFoodResponse,
	FoodDetection as ScanFoodItem,
	MealSummary as ScanMealSummary,
	MealRecommendations as ScanMealRecommendations,
	ErrorResponse
)

__all__ = [
	'ScanFoodResponse',
	'ScanFoodItem',
	'ScanMealSummary',
	'ScanMealRecommendations',
	'ErrorResponse'
]
