/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChefHat, Apple, Leaf, Clock, ChevronLeft, Download, Copy, Trash2,
  Save, Zap, Plus, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"

type MealMode = "daily" | "weekly"
type DietaryPreference = "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free" | "dairy-free" | "low-carb" | "diabetic-friendly"

interface Ingredient {
  id: string
  name: string
}

interface Preferences {
  dietary: DietaryPreference[]
  mealsPerDay: number
  mode: MealMode
  daysCount: number
}

interface Meal {
  title: string
  ingredients: string[]
  prepMinutes: number
  instructions: string
  diabeticFriendly?: boolean
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
}

// Typing Effect Component (same as SmartNutritionPage)
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

function WelcomeStep({ onStart }: { onStart: () => void }) {
  const [welcomeTextComplete, setWelcomeTextComplete] = useState(false)
  const [infoTextComplete, setInfoTextComplete] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <h1 className="text-4xl font-serif text-gray-900">Smart Meal Planner</h1>
        
        <div className="space-y-4">
          <TypingEffect
            text="Welcome to your personal meal planner. Create custom meal plans from ingredients you already have, tailored to your dietary needs."
            speed={3}
            onComplete={() => setWelcomeTextComplete(true)}
            className="text-lg"
          />
          
          {welcomeTextComplete && (
            <TypingEffect
              text="Whether you're cooking for one or feeding a family, we'll help you make the most of what's in your kitchen."
              speed={6}
              onComplete={() => setInfoTextComplete(true)}
            />
          )}
          
          {infoTextComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4"
            >
              <Button 
                onClick={onStart}
                className="h-12 px-8 text-base"
              >
                Start Planning
                <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function IngredientsStep({ 
  ingredients, 
  onAddIngredient, 
  onRemoveIngredient,
  onNext 
}: { 
  ingredients: Ingredient[];
  onAddIngredient: (name: string) => void;
  onRemoveIngredient: (id: string) => void;
  onNext: () => void;
}) {
  const [inputValue, setInputValue] = useState("")
  const [introTextComplete, setIntroTextComplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: / to focus input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleAdd = () => {
    const name = inputValue.trim()
    if (name) {
      onAddIngredient(name)
      setInputValue("")
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
            <Apple className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What&apos;s in Your Kitchen?</h2>
            <div className="text-gray-600">List the ingredients you have available</div>
          </div>
        </div>

        <TypingEffect
          text="Start by adding the main ingredients you have on hand. You can add as many as you'd like."
          speed={30}
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
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g., chicken breast, rice, tomatoes..."
                className="h-12 text-base"
              />
              <Button 
                onClick={handleAdd}
                className="h-12 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-sm text-gray-500">Press / to focus, Enter to add ingredient</p>
          </div>

          {ingredients.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
              <Apple className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No ingredients added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add at least one ingredient to continue</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing) => (
                  <Badge 
                    key={ing.id}
                    variant="secondary"
                    className="h-8 px-3 text-sm bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    {ing.name}
                    <button
                      onClick={() => onRemoveIngredient(ing.id)}
                      className="ml-2 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <Button 
                onClick={onNext}
                className="w-full h-12"
                disabled={ingredients.length === 0}
              >
                Continue to Preferences
                <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function PreferencesStep({
  preferences,
  onUpdatePreferences,
  onBack,
  onNext
}: {
  preferences: Preferences;
  onUpdatePreferences: (updates: Partial<Preferences>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [introTextComplete, setIntroTextComplete] = useState(false)

  const dietaryOptions: DietaryPreference[] = [
    "vegetarian", "vegan", "halal", "kosher", 
    "gluten-free", "dairy-free", "low-carb", "diabetic-friendly"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Preferences</h2>
            <div className="text-gray-600">Tell us about your dietary needs</div>
          </div>
        </div>

        <TypingEffect
          text="Select any dietary preferences that apply. We'll prioritize diabetic-friendly suggestions automatically."
          speed={30}
          onComplete={() => setIntroTextComplete(true)}
          className="text-gray-700"
        />
      </div>

      {introTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <Button
                    key={option}
                    variant={preferences.dietary.includes(option) ? "default" : "outline"}
                    onClick={() => {
                      const newDietary = preferences.dietary.includes(option)
                        ? preferences.dietary.filter(d => d !== option)
                        : [...preferences.dietary, option]
                      onUpdatePreferences({ dietary: newDietary })
                    }}
                    className="h-9 capitalize"
                  >
                    {option.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Plan Type</Label>
                <div className="flex gap-2">
                  {(["daily", "weekly"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={preferences.mode === mode ? "default" : "outline"}
                      onClick={() => onUpdatePreferences({ mode })}
                      className="flex-1 h-11 capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Meals Per Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={preferences.mealsPerDay}
                  onChange={(e) => onUpdatePreferences({ 
                    mealsPerDay: Math.min(6, Math.max(1, Number(e.target.value)))
                  })}
                  className="h-11 text-center"
                />
              </div>
            </div>

            {preferences.mode === "weekly" && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Number of Days</Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={preferences.daysCount}
                  onChange={(e) => onUpdatePreferences({ 
                    daysCount: Math.min(7, Math.max(1, Number(e.target.value)))
                  })}
                  className="h-11 text-center"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button 
              onClick={onNext}
              className="flex-1 h-12"
            >
              Generate Meal Plan
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function GenerateStep({
  preferences,
  ingredients,
  onBack,
  onComplete,
  isGenerating,
  onCancelGenerate
}: {
  preferences: Preferences;
  ingredients: Ingredient[];
  onBack: () => void;
  onComplete: (plan: MealPlan) => void;
  isGenerating: boolean;
  onCancelGenerate: () => void;
}) {
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null)
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed")

  // Mock generation function - replace with your actual AI generation
  const generateMockPlan = useCallback(() => {
    const plan: MealPlan = {
      id: `plan_${Date.now()}`,
      planName: `Meal Plan ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      days: Array.from({ length: preferences.mode === 'weekly' ? preferences.daysCount : 1 }, (_, i) => ({
        day: i + 1,
        meals: Array.from({ length: preferences.mealsPerDay }, (_, j) => ({
          title: `Meal ${j + 1} - Day ${i + 1}`,
          ingredients: ingredients.map(ing => ing.name).slice(0, 3),
          prepMinutes: Math.floor(Math.random() * 30) + 15,
          instructions: `Combine ingredients and cook until done. Serve hot.`,
          diabeticFriendly: preferences.dietary.includes('diabetic-friendly') || Math.random() > 0.3
        }))
      }))
    }
    
    setTimeout(() => {
      setGeneratedPlan(plan)
    }, 1500)
  }, [preferences, ingredients])

  useEffect(() => {
    if (!generatedPlan && !isGenerating) {
      generateMockPlan()
    }
  }, [generateMockPlan, generatedPlan, isGenerating])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Meal Plan</h2>
              <div className="text-gray-600">
                {preferences.mode === 'daily' ? 'Daily plan' : `${preferences.daysCount}-day plan`}
              </div>
            </div>
          </div>
          <Badge className="bg-gray-100 text-gray-700">
            {ingredients.length} ingredients
          </Badge>
        </div>

        {!generatedPlan ? (
          <TypingEffect
            text="Creating your personalized meal plan based on your ingredients and preferences..."
            speed={30}
            className="text-gray-700"
          />
        ) : (
          <TypingEffect
            text="Your meal plan is ready! Here's what we've prepared for you."
            speed={30}
            className="text-gray-700"
          />
        )}
      </div>

      {isGenerating || !generatedPlan ? (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
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
            <p className="font-medium text-gray-700 mb-2">Generating your meal plan...</p>
            <p className="text-sm text-gray-500">Analyzing {ingredients.length} ingredients and {preferences.dietary.length} preferences</p>
            <Button
              variant="outline"
              onClick={onCancelGenerate}
              className="mt-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {generatedPlan.planName}
              </h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Generated
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
              >
                {viewMode === 'compact' ? 'Detailed View' : 'Compact View'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateMockPlan()}
              >
                Regenerate
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {generatedPlan.days.map((day) => (
              <div key={day.day} className="bg-white rounded-xl border p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Day {day.day}</h4>
                <div className={viewMode === 'compact' ? 'space-y-3' : 'space-y-4'}>
                  {day.meals.map((meal, index) => (
                    <div
                      key={index}
                      className={viewMode === 'compact' 
                        ? 'flex items-center justify-between py-3 border-b last:border-0'
                        : 'bg-gray-50 rounded-lg p-4'
                      }
                    >
                      {viewMode === 'compact' ? (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">{meal.title}</span>
                            {meal.diabeticFriendly && (
                              <Badge className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Diabetic-friendly
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meal.prepMinutes} min
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">{meal.title}</span>
                            <div className="flex items-center gap-3">
                              {meal.diabeticFriendly && (
                                <Badge className="bg-green-50 text-green-700 border-green-200">
                                  Diabetic-friendly
                                </Badge>
                              )}
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-3 h-3" />
                                {meal.prepMinutes} min
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Ingredients:</span> {meal.ingredients.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">{meal.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => onComplete(generatedPlan)}
              className="flex-1 h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Plan
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function Dashboard({ savedPlans }: { savedPlans: MealPlan[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Your Saved Plans</h2>
        <TypingEffect
          text="Here are your previously generated meal plans. You can restore, export, or delete them."
          speed={30}
          className="text-gray-700"
        />
      </div>

      {savedPlans.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No saved plans yet</p>
          <p className="text-sm text-gray-400 mt-1">Generate and save your first meal plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="bg-white border rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.planName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.days.length} {plan.days.length === 1 ? 'day' : 'days'} • {plan.days[0]?.meals.length || 0} meals/day
                  </p>
                </div>
                <Badge variant="outline">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-3 h-3 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function MealPlannerPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<"welcome" | "ingredients" | "preferences" | "generate" | "dashboard">("welcome")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: ["diabetic-friendly"],
    mealsPerDay: 3,
    mode: "daily",
    daysCount: 1
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([])

  const handleAddIngredient = (name: string) => {
    setIngredients(prev => [...prev, { id: `ing_${Date.now()}`, name }])
  }

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id))
  }

  const handleUpdatePreferences = (updates: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const handleSavePlan = (plan: MealPlan) => {
    setSavedPlans(prev => [...prev, plan])
    toast({
      title: "Plan Saved",
      description: "Your meal plan has been saved successfully.",
    })
    setStep("dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        <Toaster />
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WelcomeStep onStart={() => setStep("ingredients")} />
            </motion.div>
          )}
          
          {step === "ingredients" && (
            <motion.div key="ingredients" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <IngredientsStep
                ingredients={ingredients}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onNext={() => setStep("preferences")}
              />
            </motion.div>
          )}
          
          {step === "preferences" && (
            <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={() => setStep("ingredients")} className="mb-4">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <PreferencesStep
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onBack={() => setStep("ingredients")}
                onNext={() => setStep("generate")}
              />
            </motion.div>
          )}
          
          {step === "generate" && (
            <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={() => setStep("preferences")} className="mb-4">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <GenerateStep
                preferences={preferences}
                ingredients={ingredients}
                onBack={() => setStep("preferences")}
                onComplete={handleSavePlan}
                isGenerating={isGenerating}
                onCancelGenerate={() => setIsGenerating(false)}
              />
            </motion.div>
          )}
          
          {step === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Dashboard savedPlans={savedPlans} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}