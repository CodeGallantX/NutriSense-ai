"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChefHat, DollarSign, Clock, Utensils } from "lucide-react"
import { generateMealPlan } from "./actions"

interface MealPlan {
  meals: {
    name: string
    type: string
    ingredients: string[]
    instructions: string[]
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    cost: number
    prepTime: number
    culturalContext?: string
  }[]
  totalCost: number
  totalCalories: number
  nutritionalAnalysis: string
}

export default function MealPlannerPage() {
  const [budget, setBudget] = useState(50)
  const [days, setDays] = useState(3)
  const [preferences, setPreferences] = useState("")
  const [loading, setLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateMealPlan({ budget, days, preferences })
      setMealPlan(result)
    } catch (error) {
      console.error("Error generating meal plan:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget-Based Meal Generator</h1>
            <p className="text-muted-foreground">
              AI-powered meal plans tailored to your budget, lifestyle, and cultural preferences
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Your Meal Plan</CardTitle>
            <CardDescription>
              Set your budget and preferences to get personalized, culturally-aware meal suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Weekly Budget: ${budget}</Label>
              <Slider
                value={[budget]}
                onValueChange={(value) => setBudget(value[0])}
                min={20}
                max={200}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">Adjust your weekly meal budget</p>
            </div>

            <div className="space-y-3">
              <Label>Number of Days: {days}</Label>
              <Slider
                value={[days]}
                onValueChange={(value) => setDays(value[0])}
                min={1}
                max={7}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="preferences">Dietary Preferences & Cultural Foods</Label>
              <Input
                id="preferences"
                placeholder="e.g., Nigerian cuisine, vegetarian, low-carb, diabetic-friendly..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Include dietary restrictions, cultural preferences, or health conditions
              </p>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Meal Plan...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {mealPlan && (
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Plan Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">${mealPlan.totalCost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Meals</p>
                    <p className="text-2xl font-bold">{mealPlan.meals.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Calories/Meal</p>
                    <p className="text-2xl font-bold">{Math.round(mealPlan.totalCalories / mealPlan.meals.length)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutritional Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{mealPlan.nutritionalAnalysis}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {mealPlan.meals.map((meal, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{meal.name}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{meal.type}</Badge>
                          {meal.culturalContext && <Badge variant="outline">{meal.culturalContext}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${meal.cost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">per serving</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{meal.prepTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{meal.nutrition.calories} cal</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold">Nutrition</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between rounded-md bg-muted px-3 py-2">
                          <span className="text-muted-foreground">Protein</span>
                          <span className="font-medium">{meal.nutrition.protein}g</span>
                        </div>
                        <div className="flex justify-between rounded-md bg-muted px-3 py-2">
                          <span className="text-muted-foreground">Carbs</span>
                          <span className="font-medium">{meal.nutrition.carbs}g</span>
                        </div>
                        <div className="flex justify-between rounded-md bg-muted px-3 py-2">
                          <span className="text-muted-foreground">Fat</span>
                          <span className="font-medium">{meal.nutrition.fat}g</span>
                        </div>
                        <div className="flex justify-between rounded-md bg-muted px-3 py-2">
                          <span className="text-muted-foreground">Fiber</span>
                          <span className="font-medium">{meal.nutrition.fiber}g</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold">Ingredients</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {meal.ingredients.map((ingredient, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold">Instructions</h4>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        {meal.instructions.map((instruction, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                              {i + 1}
                            </span>
                            <span className="pt-0.5">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
