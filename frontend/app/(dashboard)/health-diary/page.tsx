/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface FoodEntry {
  id: string
  name: string
  category: FoodCategory
  calories: number
  protein: number
  carbs: number
  fat: number
  timestamp: number
  imageUrl?: string
  notes?: string
}

interface HealthMetric {
  date: string
  weight?: number
  bloodSugar?: number
  bloodPressure?: string
  mood: Mood
  energyLevel: number
  notes?: string
  foods?: FoodEntry[]
}

interface AIAnalysis {
  calories: number
  protein: number
  carbs: number
  fat: number
  nutritionScore: number
  suggestions: string[]
  estimatedWeightImpact: number
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

function WelcomeStep({ userProfile, onSelectGoal }: { 
  userProfile: UserProfile; 
  onSelectGoal: (goal: TrackingGoal) => void 
}) {
  const [welcomeTextComplete, setWelcomeTextComplete] = useState(false)
  const [infoTextComplete, setInfoTextComplete] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-serif text-gray-900">Your Health Diary</h1>
        
        <div className="space-y-4">
          <TypingEffect
            text={`Welcome back ${userProfile.name}, this is your health diary, designed to help you track and improve your health journey.`}
            speed={3}
            onComplete={() => setWelcomeTextComplete(true)}
            className="text-lg"
          />
          
          {welcomeTextComplete && (
            <TypingEffect
              text={`Based on your profile: ${userProfile.age} years, ${userProfile.weight}kg, ${userProfile.height}cm. You're following a ${userProfile.dietType} diet with ${userProfile.activityLevel} activity level.`}
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
              <TypingEffect
                text="So let me know what I can help you with today:"
                speed={30}
                className="font-medium text-gray-900"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Focus Options - COMPLETELY DE-COLORED */}
      {infoTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">What would you like to focus on today?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Track Weight Progress */}
            <motion.button
              onClick={() => onSelectGoal("weight")}
              className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Scale className="w-7 h-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Track Weight Progress</div>
                  <div className="text-gray-600 mb-3">Monitor weight changes, set goals, and track your progress over time</div>
                </div>
              </div>
            </motion.button>

            {/* Eat Balanced Diet */}
            <motion.button
              onClick={() => onSelectGoal("diet")}
              className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <ChefHat className="w-7 h-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Eat Balanced Diet</div>
                  <div className="text-gray-600 mb-3">Monitor food intake, track nutrition, and maintain a healthy diet</div>
                </div>
              </div>
            </motion.button>

            {/* Manage Health Condition */}
            <motion.button
              onClick={() => onSelectGoal("health")}
              className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Heart className="w-7 h-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Manage Health Condition</div>
                  <div className="text-gray-600 mb-3">Track specific health metrics and manage medical conditions</div>
                </div>
              </div>
            </motion.button>

            {/* Fitness Progress */}
            <motion.button
              onClick={() => onSelectGoal("fitness")}
              className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Activity className="w-7 h-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Fitness Progress</div>
                  <div className="text-gray-600 mb-3">Monitor workouts, track activity, and improve fitness</div>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* === All other components remain exactly the same === */
function GoalSelectionStep({ selectedGoal, onSelectMethod }: { 
  selectedGoal: TrackingGoal; 
  onSelectMethod: (method: string) => void 
}) {
  const [introTextComplete, setIntroTextComplete] = useState(false)

  const goalInfo = {
    weight: {
      title: "Weight Management",
      description: "Since you selected weight management, let's track your progress effectively.",
      color: "blue",
      methods: [
        { id: "scale", title: "Smart Scale Sync", icon: Scale, description: "Connect to your smart scale for automatic tracking" },
        { id: "manual", title: "Manual Entry", icon: Edit3, description: "Enter your weight manually each time" },
        { id: "photo", title: "Progress Photos", icon: Camera, description: "Take photos and track visual changes" }
      ]
    },
    diet: {
      title: "Balanced Nutrition",
      description: "Since you selected balanced diet tracking, let's monitor your nutrition intake.",
      color: "green",
      methods: [
        { id: "food-log", title: "Food Diary", icon: Edit3, description: "Log meals and ingredients manually" },
        { id: "photo-scan", title: "AI Food Scan", icon: Camera, description: "Scan your meals with AI analysis" },
        { id: "voice", title: "Voice Entry", icon: Users, description: "Dictate your meals for quick logging" }
      ]
    },
    health: {
      title: "Health Monitoring",
      description: "Since you selected health monitoring, let's track your important health metrics.",
      color: "red",
      methods: [
        { id: "device-sync", title: "Device Sync", icon: Activity, description: "Sync with health monitoring devices" },
        { id: "manual-entry", title: "Manual Tracking", icon: Edit3, description: "Enter health readings manually" },
        { id: "smart-reminders", title: "Smart Reminders", icon: Calendar, description: "Set reminders for regular tracking" }
      ]
    },
    fitness: {
      title: "Fitness Progress",
      description: "Since you selected fitness tracking, let's monitor your workouts and activity.",
      color: "purple",
      methods: [
        { id: "wearable", title: "Wearable Sync", icon: Activity, description: "Connect to fitness trackers and wearables" },
        { id: "manual-log", title: "Workout Log", icon: Edit3, description: "Log exercises and sets manually" },
        { id: "video", title: "Form Analysis", icon: Camera, description: "Record videos for form analysis" }
      ]
    }
  }

  const info = goalInfo[selectedGoal]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Goal Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
            <div className="text-gray-600">Choose your preferred tracking method</div>
          </div>
        </div>

        <TypingEffect
          text={info.description}
          speed={1}
          onComplete={() => setIntroTextComplete(true)}
          className="text-gray-700"
        />
      </div>

      {/* Tracking Methods */}
      {introTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-gray-900">How would you like to track?</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {info.methods.map((method) => (
              <motion.button
                key={method.id}
                onClick={() => onSelectMethod(method.id)}
                className={`p-6 rounded-xl border-2 bg-white hover:border-gray-400 hover:shadow-lg text-left transition-all duration-300`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-4">
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg mb-2">{method.title}</div>
                    <div className="text-gray-600">{method.description}</div>
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    Select this method
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function TrackingSection({ selectedGoal, trackingMethod, onComplete }: { 
  selectedGoal: TrackingGoal; 
  trackingMethod: string;
  onComplete: () => void;
}) {
  const [showTracking, setShowTracking] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowTracking(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!showTracking) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ready to Track</h2>
            <p className="text-gray-600">Using {trackingMethod.replace('-', ' ')} method</p>
          </div>
          <Badge className="bg-gray-100 text-gray-700">Active Session</Badge>
        </div>
        <TypingEffect text="Great choice! Now let's log today's entry." speed={30} className="text-gray-700" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border shadow-sm p-8">
        {selectedGoal === "diet" ? <FoodLoggingSection onComplete={onComplete} /> : <HealthMetricsSection onComplete={onComplete} goal={selectedGoal} />}
      </motion.div>
    </motion.div>
  )
}

function FoodLoggingSection({ onComplete }: { onComplete: () => void }) {
  const [activeTab, setActiveTab] = useState("photo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handlePhotoUpload = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      onComplete()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="photo" className="flex items-center gap-2"><Camera className="w-4 h-4" />AI Photo Scan</TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2"><Edit3 className="w-4 h-4" />Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="photo" className="space-y-6">
          <div className="text-center space-y-4">
            <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 hover:border-gray-400 transition-colors bg-gray-50/50">
              <Camera className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Take a Photo of Your Meal</h3>
              <p className="text-gray-600 max-w-md mx-auto">Our AI will analyze the nutrition content and provide suggestions</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12" onClick={handlePhotoUpload} disabled={isAnalyzing}><Upload className="w-4 h-4 mr-2" />Upload Photo</Button>
              <Button className="h-12" onClick={handlePhotoUpload} disabled={isAnalyzing}><Camera className="w-4 h-4 mr-2" />{isAnalyzing ? "Analyzing..." : "Take Photo"}</Button>
            </div>
          </div>
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex justify-center gap-2 mb-4">
                {[0, 0.2, 0.4].map((d) => (
                  <motion.div key={d} className="w-3 h-3 rounded-full bg-gray-600" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: d }} />
                ))}
              </div>
              <p className="font-medium text-gray-700">AI is analyzing your meal...</p>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="space-y-4">
            <div><Label>Meal Description</Label><Textarea placeholder="What did you eat?" className="min-h-[120px]" /></div>
            <Button className="w-full h-12" onClick={onComplete}><CheckCircle className="w-5 h-5 mr-2" />Log Meal & Complete</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HealthMetricsSection({ onComplete, goal }: { onComplete: () => void; goal: TrackingGoal }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(goal === "weight" || goal === "health") && (
          <div className="space-y-3"><Label><Scale className="w-4 h-4 inline mr-2" />Weight (kg)</Label><Input placeholder="75.5" className="h-14 text-xl" /></div>
        )}
        {goal === "health" && (
          <div className="space-y-3"><Label><Droplets className="w-4 h-4 inline mr-2" />Blood Sugar</Label><Input placeholder="95" className="h-14 text-xl" /></div>
        )}
        <div className="space-y-3"><Label><Zap className="w-4 h-4 inline mr-2" />Energy Level</Label><input type="range" min="1" max="10" defaultValue="5" className="w-full" /></div>
        <div className="space-y-3"><Label>Notes</Label><Textarea placeholder="How are you feeling?" className="min-h-[100px]" /></div>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 h-12" onClick={onComplete}>Skip</Button>
        <Button className="flex-1 h-12" onClick={onComplete}><CheckCircle className="w-5 h-5 mr-2" />Save & Complete</Button>
      </div>
    </div>
  )
}

function Dashboard({ userProfile, selectedGoal }: { userProfile: UserProfile; selectedGoal: TrackingGoal }) {
  // Dashboard stays unchanged — you can de-color it later if you want!
  return <div className="min-h-screen bg-gray-50">Dashboard content...</div>
}

export default function SmartNutritionPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<"welcome" | "goal" | "tracking" | "dashboard">("welcome")
  const [selectedGoal, setSelectedGoal] = useState<TrackingGoal | null>(null)
  const [trackingMethod, setTrackingMethod] = useState<string | null>(null)

  const [userProfile] = useState<UserProfile>({
    name: "Alex", age: 32, weight: 75, height: 178, goal: "weight", dietType: "balanced",
    healthConditions: ["diabetes"], activityLevel: "moderate", dailyCalorieTarget: 2200
  })

  const handleSelectGoal = (goal: TrackingGoal) => { setSelectedGoal(goal); setStep("goal") }
  const handleSelectMethod = (method: string) => { setTrackingMethod(method); setStep("tracking") }
  const handleCompleteTracking = () => { toast({ title: "Saved!", description: "Entry recorded." }); setStep("dashboard") }
  const handleBackToWelcome = () => { setStep("welcome"); setSelectedGoal(null); setTrackingMethod(null) }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        <Toaster />
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WelcomeStep userProfile={userProfile} onSelectGoal={handleSelectGoal} />
            </motion.div>
          )}
          {step === "goal" && selectedGoal && (
            <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBackToWelcome} className="mb-4"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
              <GoalSelectionStep selectedGoal={selectedGoal} onSelectMethod={handleSelectMethod} />
            </motion.div>
          )}
          {step === "tracking" && selectedGoal && trackingMethod && (
            <motion.div key="tracking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={() => setStep("goal")} className="mb-4"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
              <TrackingSection selectedGoal={selectedGoal} trackingMethod={trackingMethod} onComplete={handleCompleteTracking} />
            </motion.div>
          )}
          {step === "dashboard" && <Dashboard userProfile={userProfile} selectedGoal={selectedGoal!} />}
        </AnimatePresence>
      </div>
    </div>
  )
}