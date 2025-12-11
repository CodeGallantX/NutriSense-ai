export interface Profile {
  id: string
  email: string
  full_name: string | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active" | null
  dietary_preferences: string[] | null
  allergies: string[] | null
  health_conditions: string[] | null
  monthly_budget_usd: number | null
  cultural_cuisine_preferences: string[] | null
  has_diabetes: boolean
  diabetes_type: "type1" | "type2" | "prediabetes" | "gestational" | null
  target_blood_sugar_min: number | null
  target_blood_sugar_max: number | null
  created_at: string
  updated_at: string
}

export interface FoodLog {
  id: string
  user_id: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  food_name: string
  food_description: string | null
  image_url: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  glycemic_index: number | null
  glycemic_load: number | null
  predicted_blood_sugar_spike: number | null
  portion_size: string | null
  cost_usd: number | null
  logged_at: string
  created_at: string
}

export interface NutritionalGap {
  id: string
  user_id: string
  nutrient_name: string
  current_intake: number
  recommended_intake: number
  unit: string
  severity: "low" | "moderate" | "high"
  analysis_date: string
  created_at: string
}

export interface MealSuggestion {
  id: string
  user_id: string
  meal_name: string
  meal_description: string | null
  ingredients: string[]
  instructions: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  estimated_cost_usd: number | null
  cultural_cuisine: string | null
  prep_time_minutes: number | null
  difficulty: "easy" | "medium" | "hard" | null
  addresses_gaps: string[] | null
  diabetes_friendly: boolean
  glycemic_load: number | null
  created_at: string
}

export interface BloodSugarReading {
  id: string
  user_id: string
  reading_mg_dl: number
  reading_type: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random"
  notes: string | null
  measured_at: string
  created_at: string
}
