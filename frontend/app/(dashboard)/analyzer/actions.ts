/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

const nutritionSchema = z.object({
  foodName: z.string().describe("Name of the food or dish"),
  description: z.string().describe("Brief description of the food"),
  ingredients: z.array(z.string()).describe("List of main ingredients identified"),
  nutrition: z.object({
    calories: z.number().describe("Total calories"),
    protein: z.number().describe("Protein in grams"),
    carbs: z.number().describe("Carbohydrates in grams"),
    fat: z.number().describe("Fat in grams"),
    fiber: z.number().describe("Fiber in grams"),
    sugar: z.number().describe("Sugar in grams"),
    sodium: z.number().describe("Sodium in milligrams"),
  }),
  glycemicIndex: z.number().describe("Glycemic index value (0-100)"),
  glycemicLoad: z.number().describe("Glycemic load value"),
  predictedBloodSugarSpike: z.number().describe("Predicted blood sugar spike in mg/dL"),
  portionSize: z.string().describe("Estimated portion size"),
  estimatedCost: z.number().describe("Estimated cost in USD"),
  healthScore: z.number().min(0).max(100).describe("Overall health score out of 100"),
  recommendations: z.array(z.string()).describe("Health recommendations or alternatives"),
})

export async function analyzeFoodImage(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

    const prompt = `Analyze this food image and provide detailed nutritional information. 
              
              Instructions:
              - Identify all visible foods and ingredients
              - Estimate portion sizes accurately
              - Calculate nutritional values based on the portions shown
              - Provide glycemic index and load (important for diabetes management)
              - Predict potential blood sugar spike in mg/dL
              - Estimate the cost of this meal in USD
              - Give a health score (0-100) based on nutritional balance
              - Provide practical recommendations for healthier alternatives or modifications
              
              Be as accurate as possible with your estimates.
              
              Output your response strictly as JSON matching this schema: ${JSON.stringify(nutritionSchema.shape)}`

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png", // Adjust mimeType if needed (e.g., "image/jpeg")
        },
      },
    ])

    const responseText = result.response.text()
    const jsonResponse = JSON.parse(responseText)
    const object = nutritionSchema.parse(jsonResponse)

    return object
  } catch (error) {
    console.error("Food analysis error:", error)
    throw new Error("Failed to analyze food image")
  }
}

interface FoodLogData {
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  foodName: string
  description: string
  imageUrl: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  glycemicIndex: number
  glycemicLoad: number
  predictedBloodSugarSpike: number
  portionSize: string
  costUsd: number
  notes?: string
}

export async function saveFoodLog(data: FoodLogData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("food_logs").insert([
    {
      user_id: user.id,
      meal_type: data.mealType,
      food_name: data.foodName,
      food_description: data.description,
      image_url: data.imageUrl,
      calories: data.calories,
      protein_g: data.protein,
      carbs_g: data.carbs,
      fat_g: data.fat,
      fiber_g: data.fiber,
      sugar_g: data.sugar,
      sodium_mg: data.sodium,
      glycemic_index: data.glycemicIndex,
      glycemic_load: data.glycemicLoad,
      predicted_blood_sugar_spike: data.predictedBloodSugarSpike,
      portion_size: data.portionSize,
      cost_usd: data.costUsd,
      logged_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("Error saving food log:", error)
    throw new Error("Failed to save food log")
  }

  // Trigger nutritional gap analysis
  await analyzeNutritionalGaps(user.id)

  return { success: true }
}

async function analyzeNutritionalGaps(userId: string) {
  const supabase = await getSupabaseServerClient()

  // Get last 7 days of food logs
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: logs } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", sevenDaysAgo.toISOString())

  if (!logs || logs.length === 0) return

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!profile) return

  // Calculate averages
  const totalDays = 7
  const avgCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0) / totalDays
  const avgProtein = logs.reduce((sum, log) => sum + (log.protein_g || 0), 0) / totalDays
  const avgCarbs = logs.reduce((sum, log) => sum + (log.carbs_g || 0), 0) / totalDays
  const avgFat = logs.reduce((sum, log) => sum + (log.fat_g || 0), 0) / totalDays
  const avgFiber = logs.reduce((sum, log) => sum + (log.fiber_g || 0), 0) / totalDays

  // Calculate recommendations based on profile
  const weight = profile.weight_kg || 70
  const recommendedProtein = weight * 0.8 // 0.8g per kg
  const recommendedFiber = 25 // general recommendation
  const recommendedCalories = 2000 // simplified, should be calculated based on activity level

  // Generate gaps using AI
  const prompt = `Based on this user's weekly nutrition data and profile, identify nutritional gaps:
  
  User Profile:
  - Age: ${profile.age}
  - Weight: ${weight}kg
  - Activity Level: ${profile.activity_level}
  - Health Conditions: ${profile.health_conditions?.join(", ") || "None"}
  
  Average Daily Intake (last 7 days):
  - Calories: ${avgCalories.toFixed(0)}
  - Protein: ${avgProtein.toFixed(1)}g
  - Carbs: ${avgCarbs.toFixed(1)}g
  - Fat: ${avgFat.toFixed(1)}g
  - Fiber: ${avgFiber.toFixed(1)}g
  
  Analyze and identify the top 3 nutritional gaps with severity levels (low, moderate, high) and recommended intake values.`

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Store gaps (simplified - in production, parse AI response properly)
  const gaps = [
    {
      nutrient_name: "Protein",
      current_intake: avgProtein,
      recommended_intake: recommendedProtein,
      unit: "g",
      severity:
        avgProtein < recommendedProtein * 0.7 ? "high" : avgProtein < recommendedProtein * 0.9 ? "moderate" : "low",
    },
    {
      nutrient_name: "Fiber",
      current_intake: avgFiber,
      recommended_intake: recommendedFiber,
      unit: "g",
      severity: avgFiber < recommendedFiber * 0.6 ? "high" : avgFiber < recommendedFiber * 0.8 ? "moderate" : "low",
    },
  ]

  // Delete old gaps and insert new ones
  await supabase.from("nutritional_gaps").delete().eq("user_id", userId)

  for (const gap of gaps) {
    await supabase.from("nutritional_gaps").insert([
      {
        user_id: userId,
        ...gap,
      },
    ])
  }
}