/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, TrendingUp, Apple, Scale, Heart, Upload, Camera, CheckCircle, Calendar, ChevronLeft, Edit3, BarChart3, ChefHat, Activity, Target, Users, Zap, Leaf, Droplets } from "lucide-react"
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
  speed = 30, 
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
        <span className="inline-block w-1 h-5 bg-blue-500 ml-1 animate-pulse"></span>
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
            speed={30}
            onComplete={() => setWelcomeTextComplete(true)}
            className="text-lg"
          />
          
          {welcomeTextComplete && (
            <TypingEffect
              text={`Based on your profile: ${userProfile.age} years, ${userProfile.weight}kg, ${userProfile.height}cm. You're following a ${userProfile.dietType} diet with ${userProfile.activityLevel} activity level.`}
              speed={20}
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

      {/* Focus Options */}
      {infoTextComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900">What would you like to focus on today?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.button
              onClick={() => onSelectGoal("weight")}
              className="p-6 rounded-xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-white hover:border-blue-300 hover:shadow-lg text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Scale className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Track Weight Progress</div>
                  <div className="text-gray-600 mb-3">Monitor weight changes, set goals, and track your progress over time</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-50">Daily Tracking</Badge>
                    <Badge variant="outline" className="bg-blue-50">Goal Setting</Badge>
                    <Badge variant="outline" className="bg-blue-50">Progress Charts</Badge>
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectGoal("diet")}
              className="p-6 rounded-xl border-2 border-green-200 bg-linear-to-br from-green-50 to-white hover:border-green-300 hover:shadow-lg text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <ChefHat className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Eat Balanced Diet</div>
                  <div className="text-gray-600 mb-3">Monitor food intake, track nutrition, and maintain a healthy diet</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50">Food Logging</Badge>
                    <Badge variant="outline" className="bg-green-50">Nutrition Analysis</Badge>
                    <Badge variant="outline" className="bg-green-50">AI Meal Scan</Badge>
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectGoal("health")}
              className="p-6 rounded-xl border-2 border-red-200 bg-linear-to-br from-red-50 to-white hover:border-red-300 hover:shadow-lg text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Heart className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Manage Health Condition</div>
                  <div className="text-gray-600 mb-3">Track specific health metrics and manage medical conditions</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-red-50">Blood Sugar</Badge>
                    <Badge variant="outline" className="bg-red-50">Blood Pressure</Badge>
                    <Badge variant="outline" className="bg-red-50">Medication Tracking</Badge>
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectGoal("fitness")}
              className="p-6 rounded-xl border-2 border-purple-200 bg-linear-to-br from-purple-50 to-white hover:border-purple-300 hover:shadow-lg text-left group transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Activity className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">Fitness Progress</div>
                  <div className="text-gray-600 mb-3">Monitor workouts, track activity, and improve fitness</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-purple-50">Workout Tracking</Badge>
                    <Badge variant="outline" className="bg-purple-50">Performance Metrics</Badge>
                    <Badge variant="outline" className="bg-purple-50">Recovery Monitoring</Badge>
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
      icon: Scale,
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
      icon: ChefHat,
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
      icon: Heart,
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
      icon: Activity,
      methods: [
        { id: "wearable", title: "Wearable Sync", icon: Activity, description: "Connect to fitness trackers and wearables" },
        { id: "manual-log", title: "Workout Log", icon: Edit3, description: "Log exercises and sets manually" },
        { id: "video", title: "Form Analysis", icon: Camera, description: "Record videos for form analysis" }
      ]
    }
  }

  const info = goalInfo[selectedGoal]
  const Icon = info.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Goal Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-${info.color}-100 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${info.color}-600`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
            <div className="text-gray-600">Choose your preferred tracking method</div>
          </div>
        </div>

        <TypingEffect
          text={info.description}
          speed={30}
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
                className={`p-6 rounded-xl border-2 bg-linear-to-br from-white to-${info.color}-50/30 hover:border-${info.color}-300 hover:shadow-lg text-left transition-all duration-300`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-full bg-${info.color}-100 flex items-center justify-center`}>
                    {typeof method.icon === 'string' ? (
                      <span className="text-xl">{method.icon}</span>
                    ) : (
                      <method.icon className={`w-6 h-6 text-${info.color}-600`} />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg mb-2">{method.title}</div>
                    <div className="text-gray-600">{method.description}</div>
                  </div>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    Select this method
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
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
    const timer = setTimeout(() => {
      setShowTracking(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (!showTracking) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Tracking Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ready to Track</h2>
            <p className="text-gray-600">Using {trackingMethod === 'photo-scan' ? 'AI Food Scan' : 
              trackingMethod === 'scale' ? 'Smart Scale' : 
              trackingMethod === 'photo' ? 'Progress Photos' : 
              trackingMethod.replace('-', ' ')} method</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            {selectedGoal === 'weight' ? 'Weight Tracking' :
             selectedGoal === 'diet' ? 'Nutrition Tracking' :
             selectedGoal === 'health' ? 'Health Monitoring' : 'Fitness Tracking'}
          </Badge>
        </div>

        <TypingEffect
          text="Great choice! Now let's log today's entry. You can use this method every time or switch between different tracking options."
          speed={30}
          className="text-gray-700"
        />
      </div>

      {/* Tracking Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border shadow-sm p-8"
      >
        {selectedGoal === "diet" ? (
          <FoodLoggingSection onComplete={onComplete} />
        ) : (
          <HealthMetricsSection onComplete={onComplete} goal={selectedGoal} />
        )}
      </motion.div>
    </motion.div>
  )
}

function FoodLoggingSection({ onComplete }: { onComplete: () => void }) {
  const [activeTab, setActiveTab] = useState("photo")
  const [mealDescription, setMealDescription] = useState("")
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            AI Photo Scan
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="photo" className="space-y-6">
          <div className="text-center space-y-4">
            <div className="border-3 border-dashed border-blue-200 rounded-2xl p-12 hover:border-blue-300 transition-colors bg-linear-to-br from-blue-50/50 to-white">
              <Camera className="w-16 h-16 mx-auto text-blue-400 mb-4" />
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Take a Photo of Your Meal</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our AI will analyze the nutrition content, calories, and provide smart suggestions
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-12"
                onClick={handlePhotoUpload}
                disabled={isAnalyzing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <Button 
                className="h-12 bg-linear-to-r from-blue-500 to-blue-600"
                onClick={handlePhotoUpload}
                disabled={isAnalyzing}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Take Photo"}
              </Button>
            </div>
          </div>
          
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center"
            >
              <div className="flex justify-center gap-2 mb-4">
                <motion.div
                  className="w-3 h-3 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <p className="font-medium text-blue-700">AI is analyzing your meal...</p>
              <p className="text-sm text-blue-600 mt-1">Detecting ingredients and calculating nutrition values</p>
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Meal Description</Label>
              <Textarea
                placeholder="What did you eat? E.g., Grilled chicken breast with quinoa and steamed vegetables..."
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                className="min-h-[120px] text-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Meal Time</Label>
                <select className="w-full h-12 rounded-lg border border-gray-300 px-3 bg-white">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Estimated Calories</Label>
                <Input type="number" placeholder="450" className="h-12" />
              </div>
            </div>
            
            <Button 
              className="w-full h-12 bg-linear-to-r from-green-500 to-green-600"
              onClick={onComplete}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Log Meal & Complete
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HealthMetricsSection({ onComplete, goal }: { 
  onComplete: () => void;
  goal: TrackingGoal;
}) {
  const [weight, setWeight] = useState("")
  const [bloodSugar, setBloodSugar] = useState("")
  const [energyLevel, setEnergyLevel] = useState(5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(goal === "weight" || goal === "health") && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Weight (kg)
            </Label>
            <Input
              type="number"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-14 text-xl"
            />
          </div>
        )}

        {goal === "health" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Blood Sugar (mg/dL)
            </Label>
            <Input
              type="number"
              placeholder="95"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              className="h-14 text-xl"
            />
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Energy Level: {energyLevel}/10
          </Label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-linear-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Notes</Label>
          <Textarea
            placeholder="How are you feeling today? Any symptoms or observations?"
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 h-12"
          onClick={() => {
            // Quick save without completing
            onComplete()
          }}
        >
          Skip for Now
        </Button>
        <Button 
          className="flex-1 h-12 bg-linear-to-r from-blue-500 to-blue-600"
          onClick={onComplete}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Save & Complete
        </Button>
      </div>
    </div>
  )
}

function Dashboard({ userProfile, selectedGoal }: {
  userProfile: UserProfile
  selectedGoal: TrackingGoal
}) {
  return (
    <div className="min-h-screen to-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-gray-900">Your Health Diary</h1>
            <p className="text-gray-600">Welcome back, {userProfile.name}. Here&apos;s your daily overview</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-linear-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-1">Today&apos;s Goal</div>
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card className="bg-linear-to-br from-green-50 to-green-100/50">
                <CardContent className="p-6">
                  <div className="text-sm text-green-600 font-medium mb-1">Calories</div>
                  <div className="text-2xl font-bold text-gray-900">1,850</div>
                  <div className="text-sm text-gray-600 mt-1">of 2,200 target</div>
                </CardContent>
              </Card>
              
              <Card className="bg-linear-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-6">
                  <div className="text-sm text-purple-600 font-medium mb-1">Active Days</div>
                  <div className="text-2xl font-bold text-gray-900">21</div>
                  <div className="text-sm text-gray-600 mt-1">this month</div>
                </CardContent>
              </Card>
              
              <Card className="bg-linear-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-6">
                  <div className="text-sm text-amber-600 font-medium mb-1">Weight Trend</div>
                  <div className="text-2xl font-bold text-gray-900">-2.3kg</div>
                  <div className="text-sm text-gray-600 mt-1">this month</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {selectedGoal === "diet" ? (
                            <ChefHat className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Scale className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {selectedGoal === "diet" ? "Lunch logged" : "Weight entry"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedGoal === "diet" ? "Chicken salad with quinoa" : "75.2 kg"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 hours ago</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-linear-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI Insights & Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <Leaf className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Nutrition Tip</div>
                      <p className="text-gray-700">Based on your activity level, aim for 25g more protein in your next meal.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Progress Update</div>
                      <p className="text-gray-700">You&apos;re on track to reach your monthly goal. Keep up the consistency!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Log & Trends */}
          <div className="space-y-6">
            {/* Quick Log */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Log</CardTitle>
                <CardDescription>Log today&apos;s entry in seconds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full h-12" variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Log Meal with Photo
                </Button>
                <Button className="w-full h-12" variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manual Entry
                </Button>
                <Button className="w-full h-12" variant="outline">
                  <Scale className="w-4 h-4 mr-2" />
                  Log Weight
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-2">
                  {[65, 70, 85, 60, 90, 75, 80].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-linear-to-t from-blue-500 to-blue-300 rounded-t-lg"
                        style={{ height: `${value}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Water Intake */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today&apos;s Progress</span>
                    <span className="font-medium">6/8 glasses</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                      <div
                        key={glass}
                        className={`h-12 rounded-lg ${
                          glass <= 6
                            ? 'bg-blue-100 border-2 border-blue-200'
                            : 'bg-gray-100 border-2 border-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SmartNutritionPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<"welcome" | "goal" | "tracking" | "dashboard">("welcome")
  const [selectedGoal, setSelectedGoal] = useState<TrackingGoal | null>(null)
  const [trackingMethod, setTrackingMethod] = useState<string | null>(null)
  
  // Mock user profile
  const [userProfile] = useState<UserProfile>({
    name: "Alex",
    age: 32,
    weight: 75,
    height: 178,
    goal: "weight",
    dietType: "balanced",
    healthConditions: ["diabetes"],
    activityLevel: "moderate",
    dailyCalorieTarget: 2200
  })

  const handleSelectGoal = (goal: TrackingGoal) => {
    setSelectedGoal(goal)
    setStep("goal")
  }

  const handleSelectMethod = (method: string) => {
    setTrackingMethod(method)
    setStep("tracking")
  }

  const handleCompleteTracking = () => {
    toast({
      title: "Entry Saved!",
      description: "Your health data has been recorded successfully.",
    })
    setStep("dashboard")
  }

  const handleBackToWelcome = () => {
    setStep("welcome")
    setSelectedGoal(null)
    setTrackingMethod(null)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-5xl mx-auto p-8">
        <Toaster />
        
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <WelcomeStep 
                userProfile={userProfile} 
                onSelectGoal={handleSelectGoal}
              />
            </motion.div>
          )}

          {step === "goal" && selectedGoal && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Button
                variant="ghost"
                onClick={handleBackToWelcome}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to options
              </Button>
              <GoalSelectionStep 
                selectedGoal={selectedGoal} 
                onSelectMethod={handleSelectMethod}
              />
            </motion.div>
          )}

          {step === "tracking" && selectedGoal && trackingMethod && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("goal")
                  setTrackingMethod(null)
                }}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to methods
              </Button>
              <TrackingSection
                selectedGoal={selectedGoal}
                trackingMethod={trackingMethod}
                onComplete={handleCompleteTracking}
              />
            </motion.div>
          )}

          {step === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard 
                userProfile={userProfile} 
                selectedGoal={selectedGoal!}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}