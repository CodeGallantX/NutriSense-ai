/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Scale, Heart, Activity, ChefHat, ArrowLeft, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

// Add these missing type definitions
type TrackingGoal = "weight" | "diet" | "health" | "fitness"
type DietType = "balanced" | "keto" | "vegetarian" | "vegan" | "mediterranean" | "diabetic"
type HealthCondition = "diabetes" | "hypertension" | "cholesterol" | "thyroid" | "none"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  goal: TrackingGoal
  dietType: DietType
  healthConditions: HealthCondition[]
  activityLevel: ActivityLevel
  dailyCalorieTarget?: number
}

interface DietEntry {
  id: string
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: string
}

interface WeightEntry {
  id: string
  date: string
  weight: number
}

interface HealthEntry {
  id: string
  date: string
  metric: string
  value: string
  notes?: string
}

interface FitnessEntry {
  id: string
  date: string
  activity: string
  duration: number
  calories: number
}

// Main Dashboard component
export default function Dashboard({ userProfile, selectedGoal }: { 
  userProfile: UserProfile; 
  selectedGoal: TrackingGoal 
}) {
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([
    {
      id: "1",
      date: "2025-01-10",
      calories: 1850,
      protein: 120,
      carbs: 180,
      fat: 55,
      meals: "Oatmeal, Chicken salad, Salmon",
    },
    { id: "2", date: "2025-01-09", calories: 2100, protein: 130, carbs: 200, fat: 65, meals: "Eggs, Rice bowl, Steak" },
    {
      id: "3",
      date: "2025-01-08",
      calories: 1950,
      protein: 115,
      carbs: 190,
      fat: 60,
      meals: "Smoothie, Pasta, Grilled chicken",
    },
  ])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([
    { id: "1", date: "2025-01-10", weight: 75.2 },
    { id: "2", date: "2025-01-09", weight: 75.8 },
    { id: "3", date: "2025-01-08", weight: 76.0 },
    { id: "4", date: "2025-01-07", weight: 76.3 },
  ])
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([
    { id: "1", date: "2025-01-10", metric: "Blood Pressure", value: "120/80", notes: "Normal" },
    { id: "2", date: "2025-01-09", metric: "Blood Sugar", value: "95", notes: "Fasting" },
    { id: "3", date: "2025-01-08", metric: "Blood Pressure", value: "118/78", notes: "Good" },
  ])
  const [fitnessEntries, setFitnessEntries] = useState<FitnessEntry[]>([
    { id: "1", date: "2025-01-10", activity: "Running", duration: 30, calories: 350 },
    { id: "2", date: "2025-01-09", activity: "Gym", duration: 60, calories: 400 },
    { id: "3", date: "2025-01-08", activity: "Cycling", duration: 45, calories: 320 },
  ])

  const [activeTab, setActiveTab] = useState<"track" | "history" | "insights">("track")
  const [showGoalSelection, setShowGoalSelection] = useState(false)

  const getGoalIcon = (goal: TrackingGoal) => {
    switch (goal) {
      case "weight": return <Scale className="w-5 h-5" />
      case "diet": return <ChefHat className="w-5 h-5" />
      case "health": return <Heart className="w-5 h-5" />
      case "fitness": return <Activity className="w-5 h-5" />
    }
  }

  const getGoalTitle = (goal: TrackingGoal) => {
    switch (goal) {
      case "weight": return "Weight Tracking"
      case "diet": return "Diet & Nutrition"
      case "health": return "Health Metrics"
      case "fitness": return "Fitness Activity"
    }
  }

  if (showGoalSelection) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-12">
            <h1 className="text-3xl font-serif text-gray-900 mb-2">Your Health Tracker</h1>
            <p className="text-gray-500">Choose what you&apos;d like to track</p>
          </div>

          <div className="grid gap-3">
            <button
              onClick={() => setShowGoalSelection(false)}
              className="p-5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left group hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Scale className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Track Weight</div>
                  <div className="text-sm text-gray-500">Monitor weight changes over time</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGoalSelection(false)}
              className="p-5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left group hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <ChefHat className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Track Diet</div>
                  <div className="text-sm text-gray-500">Monitor calories and nutrition intake</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGoalSelection(false)}
              className="p-5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left group hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Heart className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Track Health Metrics</div>
                  <div className="text-sm text-gray-500">Monitor blood pressure, sugar, etc</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGoalSelection(false)}
              className="p-5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left group hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Activity className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Track Fitness</div>
                  <div className="text-sm text-gray-500">Log workouts and activity</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setShowGoalSelection(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to goals</span>
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            {getGoalIcon(selectedGoal)}
            <h1 className="text-2xl font-medium text-gray-900">{getGoalTitle(selectedGoal)}</h1>
          </div>
          
          <p className="text-gray-500">
            Hi {userProfile.name}, you&apos;re currently tracking {getGoalTitle(selectedGoal).toLowerCase()}. Keep going!
          </p>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex gap-1 mb-8">
          <TabButton 
            active={activeTab === "track"} 
            onClick={() => setActiveTab("track")}
          >
            Track
          </TabButton>
          <TabButton 
            active={activeTab === "history"} 
            onClick={() => setActiveTab("history")}
          >
            History
          </TabButton>
          <TabButton 
            active={activeTab === "insights"} 
            onClick={() => setActiveTab("insights")}
          >
            Insights
          </TabButton>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "track" && (
            <>
              {selectedGoal === "diet" && <DietTracker entries={dietEntries} setEntries={setDietEntries} />}
              {selectedGoal === "weight" && <WeightTracker entries={weightEntries} setEntries={setWeightEntries} />}
              {selectedGoal === "health" && (
                <HealthMetricsTracker entries={healthEntries} setEntries={setHealthEntries} />
              )}
              {selectedGoal === "fitness" && <FitnessTracker entries={fitnessEntries} setEntries={setFitnessEntries} />}
            </>
          )}

          {activeTab === "history" && (
            <>
              {selectedGoal === "diet" && <DietHistory entries={dietEntries} />}
              {selectedGoal === "weight" && <WeightHistory entries={weightEntries} />}
              {selectedGoal === "health" && <HealthHistory entries={healthEntries} />}
              {selectedGoal === "fitness" && <FitnessHistory entries={fitnessEntries} />}
            </>
          )}

          {activeTab === "insights" && (
            <>
              {selectedGoal === "diet" && <DietInsights entries={dietEntries} />}
              {selectedGoal === "weight" && <WeightInsights entries={weightEntries} />}
              {selectedGoal === "health" && <HealthInsights entries={healthEntries} />}
              {selectedGoal === "fitness" && <FitnessInsights entries={fitnessEntries} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Minimalist Tab Button Component
function TabButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? "text-gray-900 bg-gray-100" 
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      {children}
    </button>
  )
}

// Redesigned Minimalist Components
function DietTracker({ entries, setEntries }: { entries: DietEntry[]; setEntries: (entries: DietEntry[]) => void }) {
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [meals, setMeals] = useState("")

  const handleSubmit = () => {
    const newEntry: DietEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      calories: Number.parseInt(calories) || 0,
      protein: Number.parseInt(protein) || 0,
      carbs: Number.parseInt(carbs) || 0,
      fat: Number.parseInt(fat) || 0,
      meals: meals,
    }
    setEntries([newEntry, ...entries])
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
    setMeals("")
  }

  const todayTarget = 2000
  const todayTotal = entries[0]?.date === new Date().toISOString().split("T")[0] ? entries[0].calories : 0

  return (
    <div className="space-y-6">
      {/* Today's Progress Card */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today&apos;s Progress</h3>
        
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Calories</span>
            <span className="text-lg font-medium text-gray-900">
              {todayTotal} <span className="text-sm text-gray-500">/ {todayTarget}</span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full"
              style={{ width: `${Math.min((todayTotal / todayTarget) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Protein</div>
            <div className="text-base font-medium text-gray-900">{entries[0]?.protein || 0}g</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Carbs</div>
            <div className="text-base font-medium text-gray-900">{entries[0]?.carbs || 0}g</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Fat</div>
            <div className="text-base font-medium text-gray-900">{entries[0]?.fat || 0}g</div>
          </div>
        </div>
      </div>

      {/* Log Entry Card */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Log Today&apos;s Intake</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Calories</Label>
            <Input
              type="number"
              placeholder="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="border-gray-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Protein (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="border-gray-200 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Carbs (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="border-gray-200 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fat (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Meals</Label>
            <Input
              placeholder="What did you eat today?"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              className="border-gray-200 rounded-lg"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>
    </div>
  )
}

function WeightTracker({
  entries,
  setEntries,
}: { entries: WeightEntry[]; setEntries: (entries: WeightEntry[]) => void }) {
  const [weight, setWeight] = useState("")

  const handleSubmit = () => {
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      weight: Number.parseFloat(weight) || 0,
    }
    setEntries([newEntry, ...entries])
    setWeight("")
  }

  const latestWeight = entries[0]?.weight
  const prevWeight = entries[1]?.weight
  const change = latestWeight && prevWeight ? latestWeight - prevWeight : 0

  return (
    <div className="space-y-6">
      {/* Current Stats Card */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-medium text-gray-900">{latestWeight || "-"}</span>
          <span className="text-gray-500">kg</span>
        </div>
        
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${change < 0 ? "text-gray-600" : "text-gray-500"}`}>
            {change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)} kg {change < 0 ? "down" : "up"}
          </div>
        )}
      </div>

      {/* Log Entry Card */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Log Weight</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="75.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border-gray-200 rounded-lg text-xl py-4"
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Weight
          </Button>
        </div>
      </div>
    </div>
  )
}

function HealthMetricsTracker({
  entries,
  setEntries,
}: { entries: HealthEntry[]; setEntries: (entries: HealthEntry[]) => void }) {
  const [metric, setMetric] = useState("")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    const newEntry: HealthEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      metric: metric,
      value: value,
      notes: notes,
    }
    setEntries([newEntry, ...entries])
    setMetric("")
    setValue("")
    setNotes("")
  }

  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Log Health Metric</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Metric Type</Label>
          <Input
            placeholder="e.g., Blood Pressure"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="border-gray-200 rounded-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Value</Label>
          <Input
            placeholder="e.g., 120/80"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border-gray-200 rounded-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Notes (optional)</Label>
          <Input
            placeholder="Any additional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-gray-200 rounded-lg"
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Metric
        </Button>
      </div>
    </div>
  )
}

function FitnessTracker({
  entries,
  setEntries,
}: { entries: FitnessEntry[]; setEntries: (entries: FitnessEntry[]) => void }) {
  const [activity, setActivity] = useState("")
  const [duration, setDuration] = useState("")
  const [calories, setCalories] = useState("")

  const handleSubmit = () => {
    const newEntry: FitnessEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      activity: activity,
      duration: Number.parseInt(duration) || 0,
      calories: Number.parseInt(calories) || 0,
    }
    setEntries([newEntry, ...entries])
    setActivity("")
    setDuration("")
    setCalories("")
  }

  const totalToday = entries
    .filter(e => e.date === new Date().toISOString().split("T")[0])
    .reduce((sum, e) => sum + e.duration, 0)

  return (
    <div className="space-y-6">
      {/* Today's Activity Card */}
      {totalToday > 0 && (
        <div className="border border-gray-100 rounded-xl p-5 bg-white">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Today&apos;s Activity</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-gray-900">{totalToday}</span>
            <span className="text-gray-500">minutes</span>
          </div>
        </div>
      )}

      {/* Log Entry Card */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Log Activity</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Activity</Label>
            <Input
              placeholder="e.g., Running, Gym"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Calories Burned</Label>
            <Input
              type="number"
              placeholder="250"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="border-gray-200 rounded-lg"
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </div>
    </div>
  )
}

// History Components (Minimalist)
function DietHistory({ entries }: { entries: DietEntry[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Entries</h2>
      {entries.length === 0 ? (
        <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
          <p className="text-gray-400">No entries yet</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="font-medium text-gray-900">{entry.calories} cal</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Protein</div>
                <div className="text-sm font-medium text-gray-900">{entry.protein}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Carbs</div>
                <div className="text-sm font-medium text-gray-900">{entry.carbs}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Fat</div>
                <div className="text-sm font-medium text-gray-900">{entry.fat}g</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">{entry.meals}</p>
          </div>
        ))
      )}
    </div>
  )
}

function WeightHistory({ entries }: { entries: WeightEntry[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Weight History</h2>
      {entries.length === 0 ? (
        <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
          <p className="text-gray-400">No entries yet</p>
        </div>
      ) : (
        entries.map((entry, index) => {
          const prevEntry = entries[index + 1]
          const change = prevEntry ? entry.weight - prevEntry.weight : 0
          
          return (
            <div key={entry.id} className="border border-gray-100 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xl font-medium text-gray-900">{entry.weight} kg</div>
                </div>
                
                {change !== 0 && (
                  <div className={`text-sm ${change < 0 ? "text-gray-600" : "text-gray-500"}`}>
                    {change < 0 ? "↓" : "↑"} {Math.abs(change).toFixed(1)}kg
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function HealthHistory({ entries }: { entries: HealthEntry[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Health History</h2>
      {entries.length === 0 ? (
        <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
          <p className="text-gray-400">No entries yet</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-gray-900 mb-1">{entry.metric}</div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-lg font-medium text-gray-900">{entry.value}</div>
            </div>
            {entry.notes && (
              <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">{entry.notes}</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function FitnessHistory({ entries }: { entries: FitnessEntry[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Activity History</h2>
      {entries.length === 0 ? (
        <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
          <p className="text-gray-400">No entries yet</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-gray-900 mb-1">{entry.activity}</div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-gray-900">{entry.duration} min</div>
                <div className="text-sm text-gray-500">{entry.calories} cal</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Insights Components (Minimalist)
function DietInsights({ entries }: { entries: DietEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
        <p className="text-gray-400">No data to analyze yet</p>
      </div>
    )
  }

  const avgCalories = Math.round(entries.reduce((sum, e) => sum + e.calories, 0) / entries.length)
  const avgProtein = Math.round(entries.reduce((sum, e) => sum + e.protein, 0) / entries.length)
  const target = 2000
  const diff = avgCalories - target

  return (
    <div className="space-y-6">
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Overview</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Average Calories</span>
              <span className="text-xl font-medium text-gray-900">{avgCalories}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {diff > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="text-gray-600">{Math.abs(diff)} cal over target</span>
                </>
              ) : diff < 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">{Math.abs(diff)} cal under target</span>
                </>
              ) : (
                <span className="text-gray-600">On target</span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Macronutrients</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Protein</span>
                <span className="font-medium text-gray-900">{avgProtein}g daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <div className="text-sm font-medium text-gray-900 mb-3">Recommendations</div>
        <ul className="space-y-3">
          {diff > 100 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Consider reducing portion sizes to meet your calorie target</span>
            </li>
          )}
          {diff < -100 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">You may need more calories to maintain energy levels</span>
            </li>
          )}
          {avgProtein < 80 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Try to increase protein intake for better muscle maintenance</span>
            </li>
          )}
          {Math.abs(diff) <= 100 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Your calorie intake is well balanced</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

function WeightInsights({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
        <p className="text-gray-400">Need at least 2 entries to show insights</p>
      </div>
    )
  }

  const latestWeight = entries[0].weight
  const oldestWeight = entries[entries.length - 1].weight
  const totalChange = latestWeight - oldestWeight
  const avgWeight = entries.reduce((sum, e) => sum + e.weight, 0) / entries.length

  return (
    <div className="space-y-6">
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Change</span>
              <span className={`text-xl font-medium ${totalChange < 0 ? "text-gray-900" : "text-gray-900"}`}>
                {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)} kg
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {totalChange < 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span className="text-gray-600">Weight loss trend</span>
                </>
              ) : totalChange > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="text-gray-600">Weight gain trend</span>
                </>
              ) : (
                <span className="text-gray-600">Weight stable</span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Statistics</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Weight</span>
                <span className="font-medium text-gray-900">{latestWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Weight</span>
                <span className="font-medium text-gray-900">{avgWeight.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <div className="text-sm font-medium text-gray-900 mb-3">Health Impact</div>
        <ul className="space-y-3">
          {totalChange < -2 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Good progress on weight loss goals</span>
            </li>
          )}
          {totalChange < -0.5 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Steady weight loss improves overall health</span>
            </li>
          )}
          {Math.abs(totalChange) <= 0.5 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Maintaining stable weight is healthy</span>
            </li>
          )}
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
            <span className="text-sm text-gray-600">Continue regular tracking for best results</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function HealthInsights({ entries }: { entries: HealthEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
        <p className="text-gray-400">No data to analyze yet</p>
      </div>
    )
  }

  const metricGroups = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.metric]) acc[entry.metric] = []
      acc[entry.metric].push(entry)
      return acc
    },
    {} as Record<string, HealthEntry[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(metricGroups).map(([metric, metricEntries]) => (
        <div key={metric} className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="space-y-4">
            <div>
              <div className="font-medium text-gray-900 mb-1">{metric}</div>
              <div className="text-sm text-gray-500">{metricEntries.length} measurements</div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <div className="text-sm text-gray-600 mb-2">Recent Values</div>
              <div className="space-y-2">
                {metricEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-medium text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <div className="text-sm font-medium text-gray-900 mb-3">Health Impact</div>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
            <span className="text-sm text-gray-600">Regular monitoring helps track health improvements</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
            <span className="text-sm text-gray-600">Share these metrics with your healthcare provider</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function FitnessInsights({ entries }: { entries: FitnessEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-100 rounded-xl p-8 text-center bg-white">
        <p className="text-gray-400">No data to analyze yet</p>
      </div>
    )
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0)
  const avgDuration = Math.round(totalMinutes / entries.length)
  const weeklyMinutes = Math.round((totalMinutes / entries.length) * 7)

  return (
    <div className="space-y-6">
      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Weekly Average</span>
              <span className="text-xl font-medium text-gray-900">{weeklyMinutes} min</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {weeklyMinutes >= 150 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span className="text-gray-600">Meeting WHO recommendations</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">{150 - weeklyMinutes} min to reach goal</span>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Statistics</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Session</span>
                <span className="font-medium text-gray-900">{avgDuration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="font-medium text-gray-900">{entries.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-5 bg-white">
        <div className="text-sm font-medium text-gray-900 mb-3">Health Impact</div>
        <ul className="space-y-3">
          {weeklyMinutes >= 150 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Excellent! Meeting WHO recommended 150 min/week</span>
            </li>
          )}
          {weeklyMinutes < 150 && (
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
              <span className="text-sm text-gray-600">Try to reach 150 minutes of activity per week</span>
            </li>
          )}
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></div>
            <span className="text-sm text-gray-600">Regular activity improves cardiovascular health</span>
          </li>
        </ul>
      </div>
    </div>
  )
}