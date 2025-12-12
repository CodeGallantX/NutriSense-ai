"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

const mealPlanSchema = z.object({
  meals: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      ingredients: z.array(z.string()),
      instructions: z.array(z.string()),
      nutrition: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        fiber: z.number(),
      }),
      cost: z.number(),
      prepTime: z.number(),
      culturalContext: z.string().optional(),
    }),
  ),
  totalCost: z.number(),
  totalCalories: z.number(),
  nutritionalAnalysis: z.string(),
})

export async function generateMealPlan({
  budget,
  days,
  preferences,
}: {
  budget: number
  days: number
  preferences: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()
    userProfile = data
  }

  const prompt = `Generate a ${days}-day meal plan with a total budget of $${budget}.

User Profile:
${
  userProfile
    ? `
- Age: ${userProfile.age}
- Weight: ${userProfile.weight_kg} kg
- Height: ${userProfile.height_cm} cm
- Activity Level: ${userProfile.activity_level}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(", ") || "None"}
- Health Goals: ${userProfile.health_goals?.join(", ") || "None"}
- Health Conditions: ${userProfile.health_conditions?.join(", ") || "None"}
`
    : "No user profile available"
}

Additional Preferences: ${preferences || "None"}

Requirements:
- Create ${days * 3} meals (breakfast, lunch, dinner for each day)
- Stay within the $${budget} total budget
- Consider the user's health conditions, especially if diabetic (focus on low glycemic index foods)
- Include culturally appropriate foods based on preferences
- Provide realistic ingredient costs and prep times
- Balance nutrition across all meals
- Include detailed cooking instructions
- Ensure meals are affordable and accessible

Focus on:
- Budget-friendly ingredients
- Nutritional balance (especially managing carbs for diabetes)
- Cultural food preferences
- Easy-to-follow recipes
- Realistic portion sizes

Output your response strictly as JSON matching this schema: ${JSON.stringify(mealPlanSchema.shape)}`

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  const jsonResponse = JSON.parse(responseText)
  const object = mealPlanSchema.parse(jsonResponse)

  // Save meal plan to database if user is authenticated
  if (user) {
    await supabase.from("meal_plans").insert({
      user_id: user.id,
      budget,
      days,
      preferences,
      meal_plan: object,
    })
  }

  return object
}