"""
Pydantic models for AI/ML endpoints
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ==================== Request/Profile Models ====================

class ProfileAI(BaseModel):
    """User profile information for AI predictions"""
    age: Optional[int] = Field(None, description="Age in years")
    weight_kg: Optional[float] = Field(None, description="Weight in kilograms")
    height_cm: Optional[float] = Field(None, description="Height in centimeters")
    gender: Optional[str] = Field(None, description="Gender (male/female/other)")
    activity_level: Optional[str] = Field(None, description="Activity level (sedentary/light/moderate/vigorous)")
    dietary_preferences: Optional[List[str]] = Field(None, description="e.g., ['vegetarian', 'vegan', 'keto']")
    allergies: Optional[List[str]] = Field(None, description="Food allergies")
    health_conditions: Optional[List[str]] = Field(None, description="Other health conditions")
    diabetes_type: Optional[str] = Field(None, description="Type 1, Type 2, Gestational")
    target_blood_sugar_min: Optional[float] = Field(None, description="Target blood sugar min (mg/dL)")
    target_blood_sugar_max: Optional[float] = Field(None, description="Target blood sugar max (mg/dL)")


class FoodLogAI(BaseModel):
    """Food log entry for analysis"""
    food_name: str = Field(..., description="Name of the food")
    calories: Optional[float] = Field(None, description="Calories in kcal")
    protein_g: Optional[float] = Field(None, description="Protein in grams")
    carbs_g: Optional[float] = Field(None, description="Carbohydrates in grams")
    fat_g: Optional[float] = Field(None, description="Fat in grams")
    fiber_g: Optional[float] = Field(None, description="Fiber in grams")
    glycemic_index: Optional[float] = Field(None, description="Glycemic Index (0-100)")
    glycemic_load: Optional[float] = Field(None, description="Glycemic Load")


# ==================== Response Models ====================

class ScanFoodResponse(BaseModel):
    """Response from food scanning endpoint"""
    predicted_class: str = Field(..., description="Predicted food class")
    confidence: float = Field(..., description="Model confidence (0.0-1.0)")
    calories: Optional[float] = Field(None, description="Calories in kcal")
    protein_g: Optional[float] = Field(None, description="Protein in grams")
    carbs_g: Optional[float] = Field(None, description="Carbohydrates in grams")
    fat_g: Optional[float] = Field(None, description="Fat in grams")
    fiber_g: Optional[float] = Field(None, description="Fiber in grams")
    glycemic_index: Optional[float] = Field(None, description="Glycemic Index")
    glycemic_load: Optional[float] = Field(None, description="Glycemic Load")
    predicted_blood_sugar_spike: Optional[float] = Field(None, description="Predicted blood sugar spike (mg/dL)")


class SpikePredictionResponse(BaseModel):
    """Response from blood sugar spike prediction"""
    predicted_spike_mg_dl: float = Field(..., description="Predicted blood sugar spike in mg/dL")
    confidence: Optional[float] = Field(None, description="Prediction confidence")
    risk_level: Optional[str] = Field(None, description="Risk level (low/moderate/high)")


class MealSuggestionAI(BaseModel):
    """Suggested meal from AI recommendations"""
    meal_name: str = Field(..., description="Name of the meal")
    meal_description: Optional[str] = Field(None, description="Description of the meal")
    ingredients: List[str] = Field(..., description="List of ingredients")
    instructions: Optional[str] = Field(None, description="Cooking instructions")
    calories: Optional[float] = Field(None, description="Estimated calories")
    protein_g: Optional[float] = Field(None, description="Protein in grams")
    carbs_g: Optional[float] = Field(None, description="Carbohydrates in grams")
    fat_g: Optional[float] = Field(None, description="Fat in grams")
    estimated_cost_usd: Optional[float] = Field(None, description="Estimated cost in USD")
    cultural_cuisine: Optional[str] = Field(None, description="Cuisine type (e.g., Italian, Indian, Mexican)")
    prep_time_minutes: Optional[int] = Field(None, description="Preparation time in minutes")
    difficulty: Optional[str] = Field(None, description="Difficulty level (easy/medium/hard)")
    addresses_gaps: Optional[List[str]] = Field(None, description="Nutritional gaps this meal addresses")
    diabetes_friendly: bool = Field(..., description="Is this meal diabetes-friendly")
    glycemic_load: Optional[float] = Field(None, description="Glycemic Load of the meal")


class NutritionalGapAI(BaseModel):
    """Identified nutritional gap in user's diet"""
    nutrient_name: str = Field(..., description="Name of the nutrient")
    current_intake: float = Field(..., description="Current intake amount")
    recommended_intake: float = Field(..., description="Recommended intake amount")
    unit: str = Field(..., description="Unit of measurement (g, mg, mcg, etc.)")
    severity: str = Field(..., description="Severity level (low/moderate/high)")
    analysis_date: datetime = Field(default_factory=datetime.utcnow, description="Date of analysis")


class MealSuggestionsResponse(BaseModel):
    """Response containing meal suggestions"""
    suggestions: List[MealSuggestionAI] = Field(..., description="List of meal suggestions")
    profile_analysis: Optional[str] = Field(None, description="Analysis of user's dietary needs")


class NutritionalAnalysisResponse(BaseModel):
    """Response from nutritional analysis"""
    gaps: List[NutritionalGapAI] = Field(..., description="List of nutritional gaps")
    summary: Optional[str] = Field(None, description="Summary of nutritional analysis")
    total_calories: Optional[float] = Field(None, description="Total calories from logs")
    average_glycemic_load: Optional[float] = Field(None, description="Average glycemic load")


# ==================== Health Check ====================

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
