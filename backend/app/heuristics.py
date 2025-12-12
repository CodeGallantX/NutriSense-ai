"""
Heuristics Module
Provides nutrition data, flags, glycemic info, and recommendations
"""
import logging
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class FoodHeuristics:
    """
    Provides nutrition data and heuristic analysis for detected foods.
    """
    
    def __init__(
        self,
        nutrition_db_path: str = None,
        glycemic_index_path: str = None,
        foods_extended_path: Optional[str] = None,
    ):
        # Set default paths
        if nutrition_db_path is None:
            base_path = Path(__file__).parent
            nutrition_db_path = base_path / "data" / "nutrition_db.json"
        
        if glycemic_index_path is None:
            base_path = Path(__file__).parent
            glycemic_index_path = base_path / "data" / "glycemic_index.json"

        if foods_extended_path is None:
            base_path = Path(__file__).parent
            foods_extended_path = base_path / "data" / "foods_extended.json"
        
        # Load databases
        self.nutrition_db = self._load_json(nutrition_db_path)
        self.glycemic_index_db = self._load_json(glycemic_index_path)
        # foods_extended.json is a list; index by normalized name for quick lookup.
        foods_extended = self._load_json(foods_extended_path)
        self.foods_extended_index = {
            self._normalize_food_name(item.get("name", "")): item
            for item in foods_extended or []
        }
        
        logger.info(f"Loaded {len(self.nutrition_db)} nutrition entries")
        logger.info(f"Loaded {len(self.glycemic_index_db)} glycemic index entries")
        logger.info(f"Loaded {len(self.foods_extended_index)} extended food entries")
    
    def _load_json(self, path: Path) -> Dict:
        """Load JSON file."""
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load {path}: {e}")
            return {}
    
    def enrich_food_item(self, food_item: Dict[str, Any]) -> Dict[str, Any]:
        name = food_item['name']
        
        # Try to find exact match (case-insensitive)
        nutrition_data = self._find_nutrition_data(name)
        glycemic_index = self._find_glycemic_index(name)
        
        # Build enriched item
        enriched = {
            "name": name,
            "confidence": food_item['confidence'],
            "source": food_item['source'],
            "calories": nutrition_data.get('calories', 0),
            "carbs": nutrition_data.get('carbs', 0),
            "protein": nutrition_data.get('protein', 0),
            "fat": nutrition_data.get('fat', 0),
            "fiber": nutrition_data.get('fiber', 0),
            "glycemic_index": glycemic_index,
            "flags": nutrition_data.get('flags', []),
            "warnings": nutrition_data.get('warnings', {})
        }
        
        # Add portion advice based on flags and GI
        enriched['portion_advice'] = self._generate_portion_advice(enriched)
        
        return enriched
    
    def _find_nutrition_data(self, food_name: str) -> Dict[str, Any]:
        # Normalize name
        normalized = self._normalize_food_name(food_name)
        
        # Try curated DB exact match first
        for key, value in self.nutrition_db.items():
            if self._normalize_food_name(key) == normalized:
                return value
        
        # Try curated DB partial match
        for key, value in self.nutrition_db.items():
            if normalized in self._normalize_food_name(key) or \
               self._normalize_food_name(key) in normalized:
                logger.debug(f"Partial match: '{food_name}' -> '{key}'")
                return value

        # Fallback to extended dataset (contains macros & GI_category)
        ext_entry = self.foods_extended_index.get(normalized)
        if ext_entry:
            return {
                "calories": ext_entry.get("calories", 0),
                "carbs": ext_entry.get("carbs", 0),
                "protein": ext_entry.get("protein", 0),
                "fat": ext_entry.get("fat", 0),
                "fiber": ext_entry.get("fiber", 0),
                "flags": [],
                "warnings": {},
            }
        
        # No match found - return defaults
        logger.warning(f"No nutrition data found for: {food_name}")
        return self._get_default_nutrition()
    
    def _find_glycemic_index(self, food_name: str) -> Optional[int]:
        """Find glycemic index for food name."""
        normalized = self._normalize_food_name(food_name)
        
        # Try curated GI exact match
        for key, value in self.glycemic_index_db.items():
            if self._normalize_food_name(key) == normalized:
                return value
        
        # Try curated GI partial match
        for key, value in self.glycemic_index_db.items():
            if normalized in self._normalize_food_name(key) or \
               self._normalize_food_name(key) in normalized:
                return value

        # Fallback to extended dataset
        ext_entry = self.foods_extended_index.get(normalized)
        if ext_entry:
            return ext_entry.get("glycemic_index")
        
        return None
    
    def _normalize_food_name(self, name: str) -> str:
        """Normalize food name for matching."""
        return name.strip().lower()
    
    def _get_default_nutrition(self) -> Dict[str, Any]:
        """Get default nutrition values for unknown foods."""
        return {
            "calories": 150,
            "carbs": 20,
            "protein": 5,
            "fat": 5,
            "fiber": 2,
            "flags": ["unknown"],
            "warnings": {}
        }
    
    def _generate_portion_advice(self, food_data: Dict[str, Any]) -> str:
        advice_parts = []
        
        # Check glycemic index
        gi = food_data.get('glycemic_index')
        if gi:
            if gi >= 70:
                advice_parts.append("High GI - limit portion for blood sugar control")
            elif gi >= 56:
                advice_parts.append("Moderate GI - consume in moderation")
            else:
                advice_parts.append("Low GI - good for steady energy")
        
        # Check flags
        flags = food_data.get('flags', [])
        if 'fried' in flags:
            advice_parts.append("Fried food - reduce portion to lower fat intake")
        if 'carb-heavy' in flags or 'starchy' in flags:
            advice_parts.append("High carb content - balance with protein and vegetables")
        
        # Check macros
        if (food_data.get('calories') or 0) > 300:
            advice_parts.append("Calorie-dense - watch portion size")
        
        if (food_data.get('fiber') or 0) < 2:
            advice_parts.append("Low fiber - pair with vegetables")
        
        return " | ".join(advice_parts) if advice_parts else "Enjoy in moderation"
    
    def calculate_meal_summary(self, enriched_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not enriched_items:
            return self._empty_meal_summary()
        
        # Calculate totals with defensive defaults (handle missing data)
        total_calories = sum(item.get('calories') or 0 for item in enriched_items)
        total_carbs = sum(item.get('carbs') or 0 for item in enriched_items)
        total_protein = sum(item.get('protein') or 0 for item in enriched_items)
        total_fat = sum(item.get('fat') or 0 for item in enriched_items)
        total_fiber = sum(item.get('fiber') or 0 for item in enriched_items)
        
        # Calculate glycemic load
        glycemic_load = self._calculate_glycemic_load(enriched_items)
        
        # Calculate component scores
        components = self._calculate_component_scores(
            enriched_items,
            total_calories,
            total_carbs,
            total_protein,
            total_fat,
            total_fiber,
            glycemic_load
        )
        
        # Calculate overall score
        overall_score = sum(components.values()) / len(components)
        
        # Determine quality
        quality = self._determine_quality(overall_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(enriched_items, components)
        
        # Generate warnings
        warnings = self._generate_warnings(enriched_items, glycemic_load)
        
        return {
            "item_count": len(enriched_items),
            "total_calories": round(total_calories, 1),
            "total_carbs": round(total_carbs, 1),
            "total_protein": round(total_protein, 1),
            "total_fat": round(total_fat, 1),
            "total_fiber": round(total_fiber, 1),
            "glycemic_load": round(glycemic_load, 1),
            "score": round(overall_score, 1),
            "quality": quality,
            "components": {k: round(v, 1) for k, v in components.items()},
            "recommendations": recommendations,
            "warnings": warnings
        }
    
    def _calculate_glycemic_load(self, items: List[Dict[str, Any]]) -> float:
        """
        Calculate total glycemic load.
        
        GL = (GI × Carbs) / 100
        """
        total_gl = 0.0
        
        for item in items:
            gi = item.get('glycemic_index') or 50  # Default medium GI
            carbs = item.get('carbs') or 0
            
            if gi and carbs:
                gl = (gi * carbs) / 100
                total_gl += gl
        
        return total_gl
    
    def _calculate_component_scores(
        self,
        items: List[Dict[str, Any]],
        total_calories: float,
        total_carbs: float,
        total_protein: float,
        total_fat: float,
        total_fiber: float,
        glycemic_load: float
    ) -> Dict[str, float]:
        """Calculate individual component scores (0-100)."""
        
        # Meal diversity (more items = better)
        diversity_score = min(100, len(items) * 25)
        
        # Nutrient completeness (balanced macros)
        protein_ratio = total_protein * 4 / total_calories if total_calories > 0 else 0
        carb_ratio = total_carbs * 4 / total_calories if total_calories > 0 else 0
        fat_ratio = total_fat * 9 / total_calories if total_calories > 0 else 0
        
        # Ideal: 30% protein, 40% carbs, 30% fat
        protein_ideal = 1 - abs(protein_ratio - 0.3)
        carb_ideal = 1 - abs(carb_ratio - 0.4)
        fat_ideal = 1 - abs(fat_ratio - 0.3)
        
        completeness_score = (protein_ideal + carb_ideal + fat_ideal) / 3 * 100
        
        # Glycemic load score (lower is better)
        if glycemic_load < 10:
            gl_score = 100
        elif glycemic_load < 20:
            gl_score = 80
        elif glycemic_load < 30:
            gl_score = 60
        else:
            gl_score = max(0, 60 - (glycemic_load - 30) * 2)
        
        # Fiber adequacy (target: 8-10g per meal)
        fiber_score = min(100, (total_fiber / 8) * 100)
        
        # Protein adequacy (target: 25-30g per meal)
        protein_score = min(100, (total_protein / 25) * 100)
        
        # Fat quality (penalize fried foods)
        fried_count = sum(1 for item in items if 'fried' in item.get('flags', []))
        fat_quality_score = max(0, 100 - fried_count * 20)
        
        # Sodium penalty (penalize processed/salty foods)
        processed_count = sum(1 for item in items if 'processed' in item.get('flags', []))
        sodium_score = max(0, 100 - processed_count * 15)
        
        # Diabetes friendly (low GI + high fiber)
        diabetes_score = (gl_score + fiber_score) / 2
        
        return {
            "meal_diversity": diversity_score,
            "nutrient_completeness": completeness_score,
            "glycemic_load_score": gl_score,
            "fiber_adequacy": fiber_score,
            "protein_adequacy": protein_score,
            "fat_quality": fat_quality_score,
            "sodium_penalty": sodium_score,
            "diabetes_friendly": diabetes_score
        }
    
    def _determine_quality(self, score: float) -> str:
        """Determine meal quality from score."""
        if score >= 80:
            return "Excellent"
        elif score >= 65:
            return "Good"
        elif score >= 50:
            return "Fair"
        elif score >= 35:
            return "Risky"
        else:
            return "Dangerous"
    
    def _generate_recommendations(
        self,
        items: List[Dict[str, Any]],
        components: Dict[str, float]
    ) -> List[str]:
        """Generate meal improvement recommendations."""
        recommendations = []
        
        # Low diversity
        if components['meal_diversity'] < 50:
            recommendations.append("Add more variety - include vegetables or sides")
        
        # Low fiber
        if components['fiber_adequacy'] < 60:
            recommendations.append("Increase fiber - add leafy greens or whole grains")
        
        # Low protein
        if components['protein_adequacy'] < 60:
            recommendations.append("Add more protein - fish, chicken, or legumes")
        
        # High glycemic load
        if components['glycemic_load_score'] < 60:
            recommendations.append("Reduce carb-heavy items or add low-GI alternatives")
        
        # Too many fried foods
        if components['fat_quality'] < 70:
            recommendations.append("Replace fried items with grilled or steamed options")
        
        return recommendations
    
    def _generate_warnings(
        self,
        items: List[Dict[str, Any]],
        glycemic_load: float
    ) -> List[str]:
        """Generate health warnings."""
        warnings = []
        
        # High glycemic load
        if glycemic_load > 30:
            warnings.append("⚠️ High glycemic load - monitor blood sugar")
        
        # Multiple fried items
        fried_count = sum(1 for item in items if 'fried' in item.get('flags', []))
        if fried_count >= 2:
            warnings.append("⚠️ Multiple fried foods - high saturated fat")
        
        # Check for specific warnings
        for item in items:
            item_warnings = item.get('warnings', {})
            if 'diabetes' in item_warnings:
                warnings.append(f"⚠️ {item['name']}: {item_warnings['diabetes']}")
        
        return list(set(warnings))  # Remove duplicates
    
    def _empty_meal_summary(self) -> Dict[str, Any]:
        """Return empty meal summary."""
        return {
            "item_count": 0,
            "total_calories": 0,
            "total_carbs": 0,
            "total_protein": 0,
            "total_fat": 0,
            "total_fiber": 0,
            "glycemic_load": 0,
            "score": 0,
            "quality": "Unknown",
            "components": {},
            "recommendations": ["No foods detected"],
            "warnings": []
        }
    
    def generate_meal_recommendations(
        self,
        enriched_items: List[Dict[str, Any]],
        meal_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate detailed meal recommendations.
        
        Args:
            enriched_items: List of enriched food items
            meal_summary: Meal summary data
            
        Returns:
            Recommendations dict with alternatives, adjustments, and additions
        """
        recommendations = {
            "healthy_alternatives": [],
            "portion_adjustments": [],
            "additions": []
        }
        
        # Generate alternatives for problematic foods
        for item in enriched_items:
            # Fried foods
            if 'fried' in item.get('flags', []):
                alt = self._get_healthy_alternative(item['name'])
                if alt:
                    recommendations['healthy_alternatives'].append(alt)
            
            # High GI foods
            if (item.get('glycemic_index') or 0) >= 70:
                recommendations['portion_adjustments'].append(
                    f"Reduce {item['name']} portion by 30-40% (high GI)"
                )
        
        # Suggest additions based on gaps
        if meal_summary['total_fiber'] < 8:
            recommendations['additions'].append(
                "Add leafy greens (spinach, kale) for fiber and minerals"
            )
        
        if meal_summary['total_protein'] < 20:
            recommendations['additions'].append(
                "Add lean protein (fish, chicken breast, tofu)"
            )
        
        if not any('vegetable' in item['name'].lower() for item in enriched_items):
            recommendations['additions'].append(
                "Add vegetable salad or steamed vegetables"
            )
        
        return recommendations
    
    def _get_healthy_alternative(self, food_name: str) -> Optional[str]:
        """Get healthy alternative for a food item."""
        alternatives = {
            "fried plantain": "Replace with boiled or boli (roasted) plantain (~40% fewer calories)",
            "fried chicken": "Use grilled or baked chicken instead",
            "fried rice": "Switch to brown rice or cauliflower rice",
            "white rice": "Use brown rice or quinoa (lower GI)",
            "jollof rice": "Reduce oil and add more vegetables to jollof"
        }
        
        normalized = food_name.lower()
        
        for key, alt in alternatives.items():
            if key in normalized:
                return alt
        
        return None
