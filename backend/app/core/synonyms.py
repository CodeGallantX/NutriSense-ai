"""
Food Name Synonyms and Canonical Mapping
Maps classifier/YOLO outputs to standardized food names for better nutrition lookup.
"""

# Synonym mapping: variant → canonical name
FOOD_SYNONYMS = {
    # Desserts & Cakes
    "strawberry_shortcake": "strawberry cake",
    "red_velvet_cake": "red velvet cake",
    "cup_cakes": "cupcake",
    "cupcakes": "cupcake",
    "cheese_cake": "cheesecake",
    "cheese cake": "cheesecake",
    "chocolate_cake": "chocolate cake",
    "vanilla_cake": "vanilla cake",
    "birthday_cake": "cake",
    
    # Beverages
    "strawberry_milkshake": "strawberry milkshake",
    "chocolate_milkshake": "chocolate milkshake",
    "vanilla_milkshake": "vanilla milkshake",
    "milk_shake": "milkshake",
    "smoothie": "fruit smoothie",
    
    # Nigerian & African foods
    "jollof_rice": "jollof rice",
    "fried_rice": "fried rice",
    "white_rice": "white rice",
    "cow_skin": "ponmo",  # Nigerian delicacy
    "cow skin": "ponmo",
    
    # Proteins
    "fried_chicken": "fried chicken",
    "grilled_chicken": "grilled chicken",
    "roasted_chicken": "roast chicken",
    "beef_stew": "beef stew",
    "fish_stew": "fish stew",
    
    # Vegetables & Sides
    "boiled_egg": "boiled egg",
    "fried_egg": "fried egg",
    "scrambled_egg": "scrambled eggs",
    "french_fries": "french fries",
    "mashed_potato": "mashed potatoes",
    "baked_potato": "baked potato",
    
    # Soups & Stews
    "egusi_soup": "egusi soup",
    "okra_soup": "okra soup",
    "vegetable_soup": "vegetable soup",
    
    # Snacks
    "meat_pie": "meat pie",
    "sausage_roll": "sausage roll",
    "spring_roll": "spring roll",
    "chin_chin": "chin chin",
    "puff_puff": "puff puff",
}

# Beverage keywords (for heuristic detection)
BEVERAGE_KEYWORDS = [
    "shake", "milkshake", "smoothie", "juice", "drink", 
    "soda", "tea", "coffee", "water", "milk"
]

# Dessert keywords (for context detection)
DESSERT_KEYWORDS = [
    "cake", "cupcake", "cookie", "brownie", "pie", 
    "pudding", "ice cream", "frozen yogurt", "cheesecake",
    "shortcake", "pastry", "donut", "doughnut"
]


def normalize_food_name(name: str) -> str:
    """
    Normalize food name to canonical form.
    
    Args:
        name: Raw food name from detector/classifier
        
    Returns:
        Canonical food name
    """
    if not name:
        return name
    
    # Convert to lowercase and strip
    normalized = name.strip().lower()
    
    # Replace underscores with spaces
    normalized = normalized.replace("_", " ")
    
    # Apply synonym mapping
    if normalized in FOOD_SYNONYMS:
        return FOOD_SYNONYMS[normalized]
    
    return normalized


def is_beverage(name: str) -> bool:
    """Check if food name suggests a beverage."""
    normalized = normalize_food_name(name)
    return any(keyword in normalized for keyword in BEVERAGE_KEYWORDS)


def is_dessert(name: str) -> bool:
    """Check if food name suggests a dessert."""
    normalized = normalize_food_name(name)
    return any(keyword in normalized for keyword in DESSERT_KEYWORDS)


def get_beverage_heuristic() -> dict:
    """
    Get default beverage heuristic when no specific match found.
    Conservative milkshake/smoothie estimates.
    """
    return {
        "name": "milkshake",
        "confidence": 0.35,
        "calories": 350,
        "carbs": 55,
        "protein": 8,
        "fat": 9,
        "fiber": 1,
        "glycemic_index": 60,
        "flags": ["beverage", "high-sugar", "dessert"],
        "source": "Heuristic",
        "advice": "High sugar beverage - consume in moderation",
        "health_warnings": {
            "diabetes": "High sugar content - monitor blood glucose",
            "weight_loss": "High calorie beverage - consider smaller portion"
        }
    }
