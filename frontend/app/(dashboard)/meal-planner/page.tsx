/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChefHat, Apple, Leaf, Clock, ChevronLeft,
  CheckCircle, Save, Plus, X, DollarSign,
  BarChart, ShoppingBag, Scale, Heart, Target, UtensilsCrossed,
  Package, Droplets, Carrot, Beef, Milk, Wheat,
  Thermometer, AlertCircle, CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type MealMode = "daily" | "weekly"
type DietaryPreference = "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free" | "dairy-free" | "low-carb" | "diabetic-friendly"
type FoodCategory = "protein" | "vegetable" | "fruit" | "grain" | "dairy" | "snack" | "beverage" | "condiment"
type PriorityLevel = "use-first" | "regular" | "can-wait"

interface Ingredient {
  id: string
  name: string
  quantity: string
  category: FoodCategory
  expiryDate?: Date
  priority: PriorityLevel
  estimatedCost?: number
}

interface Preferences {
  dietary: DietaryPreference[]
  mealsPerDay: number
  mode: MealMode
  daysCount: number
}

interface NutritionReport {
  totalItems: number
  estimatedValue: number
  categories: { [key in FoodCategory]: number }
  expiryAlerts: number
  nutritionScore: number
  wasteRisk: number
  suggestions: string[]
}

interface Meal {
  title: string
  ingredients: string[]
  prepMinutes: number
  instructions: string
  diabeticFriendly?: boolean
  costPerServing?: number
}

interface DayPlan {
  day: number
  meals: Meal[]
}

interface MealPlan {
  id: string
  planName: string
  createdAt: Date
  days: DayPlan[]
  budget?: number
}

// Typing Effect Component
function TypingEffect({
  text,
  speed = 2,
  onComplete,
  className = ""
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  return (
    <p className={`text-gray-700 leading-relaxed ${className}`}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1 h-5 bg-gray-600 ml-1 animate-pulse"></span>
      )}
    </p>
  )
}

// Welcome Step with Two Options
function WelcomeStep({
  onSelectMealPlanning,
  onSelectBudgeting
}: {
  onSelectMealPlanning: () => void;
  onSelectBudgeting: () => void;
}) {
  const [welcomeTextComplete, setWelcomeTextComplete] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <h1 className="text-4xl font-serif text-gray-900">Smart Kitchen Manager</h1>

        <div className="space-y-4">
          <TypingEffect
            text="Welcome to your kitchen companion. Whether you want to create meal plans or manage your food budget, we're here to help."
            speed={3}
            onComplete={() => setWelcomeTextComplete(true)}
            className="text-lg"
          />
        </div>
      </div>

      {welcomeTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-xl font-semibold text-gray-900">What would you like to do today?</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meal Planning Option */}
            <motion.button
              onClick={onSelectMealPlanning}
              className="p-8 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <ChefHat className="w-8 h-8 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-xl mb-3">Meal Planning</div>
                  <div className="text-gray-600 mb-4">
                    Create personalized meal plans from ingredients you have. Perfect for managing dietary needs and nutrition goals.
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    Start planning meals
                    <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Budgeting & Food Management Option */}
            <motion.button
              onClick={onSelectBudgeting}
              className="p-8 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <DollarSign className="w-8 h-8 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-xl mb-3">Budgeting & Food Management</div>
                  <div className="text-gray-600 mb-4">
                    Track your pantry items, get nutrition reports, and learn how to use food efficiently for a healthy diet.
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    Manage food inventory
                    <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Budgeting: Food Inventory Step
function FoodInventoryStep({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onNext
}: {
  ingredients: Ingredient[];
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onRemoveIngredient: (id: string) => void;
  onNext: () => void;
}) {
  const [inputValue, setInputValue] = useState("")
  const [quantity, setQuantity] = useState("")
  const [category, setCategory] = useState<FoodCategory>("protein")
  const [expiryDate, setExpiryDate] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("regular")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [introTextComplete, setIntroTextComplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const foodCategories = [
    { value: "protein", label: "Protein", icon: Beef },
    { value: "vegetable", label: "Vegetables", icon: Carrot },
    { value: "fruit", label: "Fruits", icon: Apple },
    { value: "grain", label: "Grains", icon: Wheat },
    { value: "dairy", label: "Dairy", icon: Milk },
    { value: "snack", label: "Snacks", icon: Package },
    { value: "beverage", label: "Beverages", icon: Droplets },
    { value: "condiment", label: "Condiments", icon: UtensilsCrossed }
  ]

  const handleAdd = () => {
    const name = inputValue.trim()
    if (name) {
      onAddIngredient({
        name,
        quantity: quantity || "1 unit",
        category,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        priority,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined
      })
      setInputValue("")
      setQuantity("")
      setCategory("protein")
      setExpiryDate("")
      setPriority("regular")
      setEstimatedCost("")
      inputRef.current?.focus()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Food Inventory</h2>
            <div className="text-gray-600">List all the food items you have available</div>
          </div>
        </div>

        <TypingEffect
          text="Let's take inventory of what's in your kitchen. Add each food item with details to get personalized suggestions."
          speed={3}
          onComplete={() => setIntroTextComplete(true)}
          className="text-gray-700"
        />
      </div>

      {introTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Quick Add Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Food Item</CardTitle>
              <CardDescription>Enter details about your food items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="food-name">Food Name *</Label>
                  <Input
                    ref={inputRef}
                    id="food-name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="e.g., Chicken breast, Rice, Apples..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 500g, 1 pack, 6 pieces"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {foodCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Cost (Optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="$"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <div className="flex gap-2">
                  {(["use-first", "regular", "can-wait"] as PriorityLevel[]).map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={priority === level ? "default" : "outline"}
                      onClick={() => setPriority(level)}
                      className="capitalize"
                      size="sm"
                    >
                      {level.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAdd} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add to Inventory
              </Button>
            </CardContent>
          </Card>

          {/* Current Inventory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
              <Badge variant="outline">{ingredients.length} items</Badge>
            </div>

            {ingredients.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No items added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add at least 3 items to get a nutrition report</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.category === 'protein' ? 'bg-red-50' :
                          item.category === 'vegetable' ? 'bg-green-50' :
                            item.category === 'fruit' ? 'bg-yellow-50' :
                              item.category === 'grain' ? 'bg-amber-50' :
                                'bg-gray-50'
                        }`}>
                        {(() => {
                          const CatIcon = foodCategories.find(c => c.value === item.category)?.icon || Package
                          return <CatIcon className="w-5 h-5" />
                        })()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{item.quantity}</span>
                          {item.expiryDate && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        item.priority === 'use-first' ? 'destructive' :
                          item.priority === 'regular' ? 'default' : 'outline'
                      }>
                        {item.priority.replace('-', ' ')}
                      </Badge>
                      <button
                        onClick={() => onRemoveIngredient(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ingredients.length > 0 && (
              <Button
                onClick={onNext}
                className="w-full h-12"
                disabled={ingredients.length < 3}
              >
                Generate Nutrition Report
                <BarChart className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Nutrition Report Step
function NutritionReportStep({
  ingredients,
  onBack,
  onNext
}: {
  ingredients: Ingredient[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [report, setReport] = useState<NutritionReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate generating report
    const timer = setTimeout(() => {
      const categories = {} as { [key in FoodCategory]: number }
      ingredients.forEach(ing => {
        categories[ing.category] = (categories[ing.category] || 0) + 1
      })

      const expiryAlerts = ingredients.filter(ing =>
        ing.expiryDate && new Date(ing.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length

      const estimatedValue = ingredients.reduce((sum, ing) =>
        sum + (ing.estimatedCost || 0), 0
      )

      const nutritionScore = Math.min(
        100,
        Math.floor((ingredients.length / 20) * 100) + // More items = better
        (Object.keys(categories).length * 10) + // More variety = better
        (expiryAlerts > 0 ? -20 : 20) // No expiry alerts = better
      )

      const wasteRisk = Math.min(
        100,
        Math.floor((expiryAlerts / ingredients.length) * 100) * 2
      )

      setReport({
        totalItems: ingredients.length,
        estimatedValue,
        categories,
        expiryAlerts,
        nutritionScore,
        wasteRisk,
        suggestions: [
          "Prioritize using proteins and fresh vegetables first",
          "Consider freezing items approaching expiry",
          "Plan meals around your most perishable items",
          "Balance your meals with grains and vegetables"
        ]
      })
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [ingredients])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center py-12">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 0.2, 0.4].map((delay) => (
              <motion.div
                key={delay}
                className="w-3 h-3 rounded-full bg-gray-600"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay }}
              />
            ))}
          </div>
          <p className="font-medium text-gray-700 mb-2">Analyzing your food inventory...</p>
          <p className="text-sm text-gray-500">Generating nutrition insights and suggestions</p>
        </div>
      </motion.div>
    )
  }

  if (!report) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <BarChart className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nutrition Report</h2>
            <div className="text-gray-600">Analysis of your current food inventory</div>
          </div>
        </div>

        <TypingEffect
          text="Based on your inventory, here's how you can create balanced, healthy meals while minimizing waste."
          speed={30}
          className="text-gray-700"
        />
      </div>

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{report.totalItems}</div>
              <div className="text-sm text-gray-500 mt-1">food items in inventory</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Estimated Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${report.estimatedValue.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">worth of food</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Expiry Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{report.expiryAlerts}</div>
              <div className="text-sm text-gray-500 mt-1">items expiring soon</div>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Score & Waste Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Nutrition Score
              </CardTitle>
              <CardDescription>How balanced is your inventory?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Score</span>
                  <span className="font-semibold text-gray-900">{report.nutritionScore}/100</span>
                </div>
                <Progress value={report.nutritionScore} className="h-2" />
              </div>
              <p className="text-sm text-gray-600">
                {report.nutritionScore > 80
                  ? "Excellent variety! You have a well-balanced inventory."
                  : report.nutritionScore > 60
                    ? "Good start! Consider adding more variety."
                    : "Consider adding more food groups for balanced nutrition."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Waste Risk
              </CardTitle>
              <CardDescription>Risk of food going to waste</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level</span>
                  <span className="font-semibold text-gray-900">{report.wasteRisk}%</span>
                </div>
                <Progress value={report.wasteRisk} className="h-2" />
              </div>
              <p className="text-sm text-gray-600">
                {report.wasteRisk > 70
                  ? "High risk! Use perishable items immediately."
                  : report.wasteRisk > 40
                    ? "Moderate risk. Plan meals around expiring items."
                    : "Low risk. Your inventory is well-managed."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Food Categories</CardTitle>
            <CardDescription>Distribution of your food items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(report.categories).map(([category, count]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-500">{count} items</span>
                  </div>
                  <Progress value={(count / report.totalItems) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Healthy Eating Suggestions
            </CardTitle>
            <CardDescription>How to use your food for a balanced diet</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Inventory
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 h-12"
          >
            Get Meal Suggestions
            <ChefHat className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Meal Suggestions Step
function MealSuggestionsStep({
  ingredients,
  onBack,
  onComplete
}: {
  ingredients: Ingredient[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const [suggestions, setSuggestions] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate generating meal suggestions
    const timer = setTimeout(() => {
      const proteinItems = ingredients.filter(i => i.category === 'protein').slice(0, 3)
      const veggieItems = ingredients.filter(i => i.category === 'vegetable').slice(0, 3)
      const grainItems = ingredients.filter(i => i.category === 'grain').slice(0, 2)

      const mealIdeas: Meal[] = [
        {
          title: "Stir-fry Protein Bowl",
          ingredients: [
            proteinItems[0]?.name || "Chicken",
            veggieItems[0]?.name || "Broccoli",
            veggieItems[1]?.name || "Bell peppers",
            "Soy sauce",
            "Garlic"
          ],
          prepMinutes: 25,
          instructions: "Stir-fry protein and vegetables with garlic and soy sauce. Serve over rice or noodles.",
          costPerServing: 3.50
        },
        {
          title: "Hearty Soup",
          ingredients: [
            proteinItems[1]?.name || "Beans",
            veggieItems[2]?.name || "Carrots",
            "Onion",
            "Vegetable broth",
            "Herbs"
          ],
          prepMinutes: 40,
          instructions: "Sauté vegetables, add broth and protein, simmer until cooked through.",
          diabeticFriendly: true,
          costPerServing: 2.75
        },
        {
          title: "Grain Salad",
          ingredients: [
            grainItems[0]?.name || "Quinoa",
            veggieItems[0]?.name || "Cucumber",
            "Tomato",
            "Lemon juice",
            "Olive oil"
          ],
          prepMinutes: 20,
          instructions: "Cook grains, chop vegetables, mix with dressing. Add protein if available.",
          diabeticFriendly: true,
          costPerServing: 2.25
        }
      ]

      setSuggestions(mealIdeas)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [ingredients])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meal Suggestions</h2>
            <div className="text-gray-600">Healthy meals you can make with your inventory</div>
          </div>
        </div>

        <TypingEffect
          text="Here are some healthy meal ideas based on the food you have. Each suggestion uses items from your inventory."
          speed={30}
          className="text-gray-700"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 0.2, 0.4].map((delay) => (
              <motion.div
                key={delay}
                className="w-3 h-3 rounded-full bg-gray-600"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay }}
              />
            ))}
          </div>
          <p className="font-medium text-gray-700 mb-2">Creating meal suggestions...</p>
          <p className="text-sm text-gray-500">Analyzing your food items for optimal combinations</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((meal, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{meal.title}</CardTitle>
                    {meal.diabeticFriendly && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Diabetic-friendly
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meal.prepMinutes} min • ${meal.costPerServing?.toFixed(2)}/serving
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.map((ing, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-600">{meal.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Healthy Eating Tips</CardTitle>
              <CardDescription>Maximize nutrition from your food</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Portion Control</p>
                  <p className="text-sm text-gray-600">Aim for balanced portions: ½ plate vegetables, ¼ protein, ¼ grains</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Variety Matters</p>
                  <p className="text-sm text-gray-600">Rotate between different protein sources and vegetable types</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Thermometer className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Cook Smart</p>
                  <p className="text-sm text-gray-600">Steam or roast instead of frying to preserve nutrients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Report
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Suggestions
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function SmartKitchenPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<"welcome" | "budgeting" | "report" | "suggestions">("welcome")
  const [mode, setMode] = useState<"meal-planning" | "budgeting" | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const handleSelectMealPlanning = () => {
    setMode("meal-planning")

  }

  const handleSelectBudgeting = () => {
    setMode("budgeting")
    setStep("budgeting")
  }

  const handleAddIngredient = (ing: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      ...ing,
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setIngredients(prev => [...prev, newIngredient])
  }

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id))
  }

  const handleCompleteBudgeting = () => {
    toast({
      title: "Analysis Complete",
      description: "Your nutrition report and meal suggestions have been saved.",
    })
    setStep("welcome")
    setIngredients([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        <Toaster />
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WelcomeStep
                onSelectMealPlanning={handleSelectMealPlanning}
                onSelectBudgeting={handleSelectBudgeting}
              />
            </motion.div>
          )}

          {step === "budgeting" && (
            <motion.div key="budgeting" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button
                variant="ghost"
                onClick={() => setStep("welcome")}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Options
              </Button>
              <FoodInventoryStep
                ingredients={ingredients}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onNext={() => setStep("report")}
              />
            </motion.div>
          )}

          {step === "report" && (
            <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button
                variant="ghost"
                onClick={() => setStep("budgeting")}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Inventory
              </Button>
              <NutritionReportStep
                ingredients={ingredients}
                onBack={() => setStep("budgeting")}
                onNext={() => setStep("suggestions")}
              />
            </motion.div>
          )}

          {step === "suggestions" && (
            <motion.div key="suggestions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button
                variant="ghost"
                onClick={() => setStep("report")}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Report
              </Button>
              <MealSuggestionsStep
                ingredients={ingredients}
                onBack={() => setStep("report")}
                onComplete={handleCompleteBudgeting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}