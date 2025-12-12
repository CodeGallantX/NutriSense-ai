/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getUserProfile } from "@/app/actions/chat"
import type { Profile } from "@/types/database"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, TrendingUp, Apple, Scale, Heart, Upload, Camera, CheckCircle, 
  Calendar, ChevronLeft, Edit3, BarChart3, ChefHat, Activity, Target, 
  Users, Zap, Leaf, Droplets 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Dashboard from "@/components/health-diary-dashboard"

type TrackingGoal = "weight" | "diet" | "health" | "fitness"
type DietType = "balanced" | "keto" | "vegetarian" | "vegan" | "mediterranean" | "diabetic"
type HealthCondition = "diabetes" | "hypertension" | "cholesterol" | "thyroid" | "none"
type Mood = "Happy" | "Neutral" | "Stressed" | "Tired" | "Energetic"
type FoodCategory = "breakfast" | "lunch" | "dinner" | "snack"
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

// Typing Effect Component - Simplified
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
    <p className={`text-gray-600 leading-relaxed ${className}`}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse"></span>
      )}
    </p>
  )
}

function WelcomeStep({ userProfile, onSelectGoal }: { 
  userProfile: UserProfile; 
  onSelectGoal: (goal: TrackingGoal) => void 
}) {
  const [welcomeTextComplete, setWelcomeTextComplete] = useState(false)
  const [infoTextComplete, setInfoTextComplete] = useState(false)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-medium text-gray-900">Your Health Diary</h1>
        
        <div className="space-y-4">
          <TypingEffect
            text={`Hi ${userProfile.name}, welcome to your health diary.`}
            speed={3}
            onComplete={() => setWelcomeTextComplete(true)}
            className="text-base"
          />
          
          {welcomeTextComplete && (
            <TypingEffect
              text={`You're ${userProfile.age} years old, ${userProfile.weight}kg, following a ${userProfile.dietType} diet.`}
              speed={6}
              onComplete={() => setInfoTextComplete(true)}
            />
          )}
          
          {infoTextComplete && (
            <div className="pt-2">
              <p className="font-medium text-gray-900">What would you like to track today?</p>
            </div>
          )}
        </div>
      </div>

      {/* Focus Options - Minimalist */}
      {infoTextComplete && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelectGoal("weight")}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-gray-700" />
                </div>
                <span className="font-medium text-gray-900">Weight</span>
              </div>
              <p className="text-xs text-gray-500">Monitor weight changes</p>
            </button>

            <button
              onClick={() => onSelectGoal("diet")}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-gray-700" />
                </div>
                <span className="font-medium text-gray-900">Diet</span>
              </div>
              <p className="text-xs text-gray-500">Track nutrition intake</p>
            </button>

            <button
              onClick={() => onSelectGoal("health")}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gray-700" />
                </div>
                <span className="font-medium text-gray-900">Health</span>
              </div>
              <p className="text-xs text-gray-500">Monitor health metrics</p>
            </button>

            <button
              onClick={() => onSelectGoal("fitness")}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-gray-700" />
                </div>
                <span className="font-medium text-gray-900">Fitness</span>
              </div>
              <p className="text-xs text-gray-500">Track workouts</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalSelectionStep({ selectedGoal, onSelectMethod }: { 
  selectedGoal: TrackingGoal; 
  onSelectMethod: (method: string) => void 
}) {
  const [introTextComplete, setIntroTextComplete] = useState(false)

  const goalInfo = {
    weight: {
      title: "Track Weight",
      description: "Choose how you'd like to track your weight.",
      methods: [
        { id: "scale", title: "Smart Scale", icon: Scale, description: "Connect to smart scale" },
        { id: "manual", title: "Manual Entry", icon: Edit3, description: "Enter manually" },
        { id: "photo", title: "Progress Photos", icon: Camera, description: "Take photos" }
      ]
    },
    diet: {
      title: "Track Diet",
      description: "Choose how you'd like to track your meals.",
      methods: [
        { id: "food-log", title: "Food Diary", icon: Edit3, description: "Log meals manually" },
        { id: "photo-scan", title: "AI Food Scan", icon: Camera, description: "Scan meals with AI" },
        { id: "voice", title: "Voice Entry", icon: Users, description: "Dictate meals" }
      ]
    },
    health: {
      title: "Track Health",
      description: "Choose how you'd like to track health metrics.",
      methods: [
        { id: "device-sync", title: "Device Sync", icon: Activity, description: "Sync with devices" },
        { id: "manual-entry", title: "Manual Entry", icon: Edit3, description: "Enter readings" },
        { id: "smart-reminders", title: "Reminders", icon: Calendar, description: "Set reminders" }
      ]
    },
    fitness: {
      title: "Track Fitness",
      description: "Choose how you'd like to track workouts.",
      methods: [
        { id: "wearable", title: "Wearable Sync", icon: Activity, description: "Connect to trackers" },
        { id: "manual-log", title: "Workout Log", icon: Edit3, description: "Log exercises" },
        { id: "video", title: "Form Analysis", icon: Camera, description: "Record videos" }
      ]
    }
  }

  const info = goalInfo[selectedGoal]

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div className="space-y-3">
        <h2 className="text-xl font-medium text-gray-900">{info.title}</h2>
        
        <TypingEffect
          text={info.description}
          speed={1}
          onComplete={() => setIntroTextComplete(true)}
          className="text-gray-600"
        />
      </div>

      {/* Tracking Methods - Minimalist */}
      {introTextComplete && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Choose tracking method:</p>
          <div className="space-y-2">
            {info.methods.map((method) => (
              <button
                key={method.id}
                onClick={() => onSelectMethod(method.id)}
                className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <method.icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{method.title}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TrackingSection({ selectedGoal, trackingMethod, onComplete }: { 
  selectedGoal: TrackingGoal; 
  trackingMethod: string;
  onComplete: () => void;
}) {
  const [showTracking, setShowTracking] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowTracking(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (!showTracking) return null

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-medium text-gray-900">Log Entry</h2>
        <p className="text-gray-600">Using {trackingMethod.replace('-', ' ')}</p>
      </div>

      <div className="border border-gray-100 rounded-lg p-5 bg-white">
        {selectedGoal === "diet" ? <FoodLoggingSection onComplete={onComplete} /> : <HealthMetricsSection onComplete={onComplete} goal={selectedGoal} />}
      </div>
    </div>
  )
}

function FoodLoggingSection({ onComplete }: { onComplete: () => void }) {
  const [activeTab, setActiveTab] = useState<"photo" | "manual">("photo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handlePhotoUpload = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      onComplete()
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab("photo")}
          className={`flex-1 py-2 text-sm rounded-lg border ${activeTab === "photo" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"}`}
        >
          <Camera className="w-4 h-4 inline mr-2" />
          AI Photo Scan
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2 text-sm rounded-lg border ${activeTab === "manual" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"}`}
        >
          <Edit3 className="w-4 h-4 inline mr-2" />
          Manual Entry
        </button>
      </div>

      {activeTab === "photo" ? (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
            <Camera className="w-8 h-8 mx-auto text-gray-500 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Take a photo of your meal</h3>
            <p className="text-sm text-gray-500 mb-4">AI will analyze nutrition content</p>
            <div className="space-y-2">
              <button
                onClick={handlePhotoUpload}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                {isAnalyzing ? "Analyzing..." : "Take Photo"}
              </button>
              <button
                onClick={handlePhotoUpload}
                disabled={isAnalyzing}
                className="w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Photo
              </button>
            </div>
          </div>
          {isAnalyzing && (
            <div className="border border-gray-100 rounded-lg p-4 text-center bg-gray-50">
              <div className="flex justify-center gap-1 mb-3">
                {[0, 0.2, 0.4].map((d) => (
                  <div key={d} className="w-2 h-2 rounded-full bg-gray-600" />
                ))}
              </div>
              <p className="text-sm text-gray-600">AI is analyzing your meal...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700 mb-1">Meal Description</Label>
            <Textarea 
              placeholder="What did you eat?" 
              className="min-h-[100px] border-gray-200"
            />
          </div>
          <button
            onClick={onComplete}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Log Meal
          </button>
        </div>
      )}
    </div>
  )
}

function HealthMetricsSection({ onComplete, goal }: { onComplete: () => void; goal: TrackingGoal }) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {(goal === "weight" || goal === "health") && (
          <div>
            <Label className="text-sm text-gray-700 mb-1">Weight (kg)</Label>
            <Input placeholder="75.5" className="border-gray-200" />
          </div>
        )}
        {goal === "health" && (
          <div>
            <Label className="text-sm text-gray-700 mb-1">Blood Sugar</Label>
            <Input placeholder="95" className="border-gray-200" />
          </div>
        )}
        <div>
          <Label className="text-sm text-gray-700 mb-1">Notes</Label>
          <Textarea placeholder="How are you feeling?" className="min-h-20 border-gray-200" />
        </div>
      </div>
      <div className="space-y-2">
        <button
          onClick={onComplete}
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Save Entry
        </button>
        <button
          onClick={onComplete}
          className="w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

export default function SmartNutritionPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<"welcome" | "goal" | "tracking" | "dashboard">("welcome")
  const [selectedGoal, setSelectedGoal] = useState<TrackingGoal | null>(null)
  const [trackingMethod, setTrackingMethod] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Loading...", age: 0, weight: 0, height: 0, goal: "weight", dietType: "balanced",
    healthConditions: [], activityLevel: "moderate", dailyCalorieTarget: 2200
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const profile = await getUserProfile(user.id)
          
          if (profile) {
            setUserProfile({
              name: profile.full_name || "User",
              age: profile.age || 0,
              weight: profile.weight_kg || 0,
              height: profile.height_cm || 0,
              goal: (profile.primary_goal?.toLowerCase() as TrackingGoal) || "weight",
              dietType: (profile.eating_pattern?.toLowerCase() as DietType) || "balanced",
              healthConditions: profile.health_conditions?.map(hc => hc.toLowerCase() as HealthCondition) || [],
              activityLevel: profile.activity_level || "moderate",
              dailyCalorieTarget: calculateDailyCalories(profile)
            })
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  function calculateDailyCalories(profile: Profile): number {
    if (!profile.weight_kg || !profile.height_cm || !profile.age) return 2000
    
    let bmr: number
    if (profile.gender === "male") {
      bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5
    } else {
      bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    
    return Math.round(bmr * (activityMultipliers[profile.activity_level || "moderate"]))
  }

  const handleSelectGoal = (goal: TrackingGoal) => { setSelectedGoal(goal); setStep("goal") }
  const handleSelectMethod = (method: string) => { setTrackingMethod(method); setStep("tracking") }
  const handleCompleteTracking = () => { 
    toast({ 
      title: "Saved", 
      description: "Entry recorded successfully." 
    }); 
    setStep("dashboard") 
  }
  const handleBackToWelcome = () => { setStep("welcome"); setSelectedGoal(null); setTrackingMethod(null) }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <Toaster />
        
        {/* Back Button - Conditionally shown */}
        {step !== "welcome" && step !== "dashboard" && (
          <button
            onClick={step === "goal" ? handleBackToWelcome : () => setStep("goal")}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div 
              key="welcome" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
            >
              <WelcomeStep userProfile={userProfile} onSelectGoal={handleSelectGoal} />
            </motion.div>
          )}
          
          {step === "goal" && selectedGoal && (
            <motion.div 
              key="goal" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
            >
              <GoalSelectionStep selectedGoal={selectedGoal} onSelectMethod={handleSelectMethod} />
            </motion.div>
          )}
          
          {step === "tracking" && selectedGoal && trackingMethod && (
            <motion.div 
              key="tracking" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
            >
              <TrackingSection selectedGoal={selectedGoal} trackingMethod={trackingMethod} onComplete={handleCompleteTracking} />
            </motion.div>
          )}
          
          {step === "dashboard" && selectedGoal && (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
            >
              <Dashboard userProfile={userProfile} selectedGoal={selectedGoal} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}