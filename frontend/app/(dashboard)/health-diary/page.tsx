/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, TrendingUp, Minus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type Goal = "loss" | "gain" | "maintain"
type Mood = "Happy" | "Okay" | "Stressed" | "Tired" | "Sick"
type TrackingFrequency = "daily" | "weekly" | "custom"
type Trend = "improving" | "declining" | "neutral"

interface ScanResult {
  estimatedWeight: number
  estimatedFat: number
  validationScore: number
}

interface HealthLog {
  date: string
  weight: string
  bloodSugar: string
  bloodPressure: string
  mood: Mood
  timestamp: number
}

const steps = [
  // Step 1: Goal
  {
    key: "goal",
    label: "What's Your Goal?",
    description: "Let's start by understanding what you want to achieve",
  },
  // Step 2: Tracking Frequency
  {
    key: "trackingFrequency",
    label: "How Often Will You Track?",
    description: "Choose a tracking frequency that works for you",
  },
  // Step 3: Metrics
  {
    key: "metrics",
    label: "Enter Today's Metrics",
    description: "Track your current health measurements",
  },
  // Step 4: AI Analysis
  {
    key: "aiAnalysis",
    label: "AI-Powered Tracking",
    description: "Upload photos for AI analysis and insights",
  },
]

interface FormData {
  goal: Goal | null;
  trackingFrequency: TrackingFrequency | null;
  weight: string;
  bloodSugar: string;
  systolic: string;
  diastolic: string;
  mood: Mood;
}

function UploadBox({
  label,
}: {
  label: string;
}) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
      <p className="text-sm text-gray-500 mb-4">Drag & drop or click to upload</p>
      <Button variant="outline" className="w-full">Choose File</Button>
    </div>
  );
}

interface TimelineItemProps {
  date: string;
  weight: number;
  bloodSugar: number;
  bloodPressure: string;
  mood: Mood;
  trend: Trend;
}

function TimelineItem({
  date,
  weight,
  bloodSugar,
  bloodPressure,
  mood,
  trend,
}: TimelineItemProps) {
  const trendColor = trend === "improving" ? "text-green-600" : trend === "declining" ? "text-red-600" : "text-gray-600";
  const trendIcon = trend === "improving" ? "📈" : trend === "declining" ? "📉" : "➡️";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{date}</span>
        <span className={`text-sm font-semibold ${trendColor}`}>{trendIcon} {trend}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Weight</div>
          <div className="font-semibold">{weight} kg</div>
        </div>
        <div>
          <div className="text-gray-500">Blood Sugar</div>
          <div className="font-semibold">{bloodSugar} mg/dL</div>
        </div>
        <div>
          <div className="text-gray-500">Blood Pressure</div>
          <div className="font-semibold">{bloodPressure}</div>
        </div>
        <div>
          <div className="text-gray-500">Mood</div>
          <div className="font-semibold flex items-center">
            {mood === "Happy" ? "😊" : mood === "Okay" ? "😐" : mood === "Stressed" ? "😰" : mood === "Tired" ? "😴" : "🤒"}
            {mood}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CustomSelect<T extends string>({
  options,
  value,
  onChange,
  title,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  title: string;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700 block text-center">{title}</Label>
      <div className="grid grid-cols-1 gap-3 max-h-96">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`p-4 rounded-xl border-2 text-center font-medium text-lg ${
                selected
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              whileHover={{ scale: selected ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MoodSelect({
  value,
  onChange,
}: {
  value: Mood;
  onChange: (value: Mood) => void;
}) {
  const moodOptions = [
    { value: "Happy" as Mood, label: "😊 Happy" },
    { value: "Okay" as Mood, label: "😐 Okay" },
    { value: "Stressed" as Mood, label: "😰 Stressed" },
    { value: "Tired" as Mood, label: "😴 Tired" },
    { value: "Sick" as Mood, label: "🤒 Sick" },
  ];
  return <CustomSelect options={moodOptions} value={value} onChange={onChange} title="How are you feeling today?" />;
}

function MetricsInputs({
  formData,
  onInputChange,
}: {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 block text-center">Weight (kg)</Label>
        <Input
          type="number"
          placeholder="70.0"
          value={formData.weight}
          onChange={(e) => onInputChange("weight", e.target.value)}
          className="w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4"
        />
      </div>
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 block text-center">Blood Sugar (mg/dL)</Label>
        <Input
          type="number"
          placeholder="95"
          value={formData.bloodSugar}
          onChange={(e) => onInputChange("bloodSugar", e.target.value)}
          className="w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 block text-center">Systolic</Label>
          <Input
            type="number"
            placeholder="120"
            value={formData.systolic}
            onChange={(e) => onInputChange("systolic", e.target.value)}
            className="w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 block text-center">Diastolic</Label>
          <Input
            type="number"
            placeholder="80"
            value={formData.diastolic}
            onChange={(e) => onInputChange("diastolic", e.target.value)}
            className="w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4"
          />
        </div>
      </div>
      <MoodSelect value={formData.mood} onChange={(v) => onInputChange("mood", v)} />
    </div>
  );
}

function GoalSelect({
  formData,
  onInputChange,
}: {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}) {
  const goalOptions = [
    { value: "loss" as Goal, label: "Weight Loss\nReduce body weight and burn fat" },
    { value: "gain" as Goal, label: "Weight Gain\nBuild muscle and increase body mass" },
    { value: "maintain" as Goal, label: "Maintain Weight\nStay healthy and keep current weight" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3">
      {goalOptions.map((opt) => {
        const selected = formData.goal === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onInputChange("goal", opt.value)}
            className={`p-6 rounded-xl border-2 text-left font-medium text-lg whitespace-pre-line ${
              selected
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
            whileHover={{ scale: selected ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function FrequencySelect({
  formData,
  onInputChange,
}: {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}) {
  const freqOptions = [
    { value: "daily" as TrackingFrequency, label: "Daily Tracking\nBest for consistent progress and detailed insights" },
    { value: "weekly" as TrackingFrequency, label: "Weekly Check-ins\nPerfect for busy schedules and long-term trends" },
    { value: "custom" as TrackingFrequency, label: "Custom Schedule\nTrack whenever you feel like it" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3">
      {freqOptions.map((opt) => {
        const selected = formData.trackingFrequency === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onInputChange("trackingFrequency", opt.value)}
            className={`p-6 rounded-xl border-2 text-left font-medium text-lg whitespace-pre-line ${
              selected
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
            whileHover={{ scale: selected ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function AIAnalysisSection({
  formData,
  onInputChange,
  isScanning,
  scanResult,
  handleScan,
  handleSaveLog,
}: {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
  isScanning: boolean;
  scanResult: ScanResult | null;
  handleScan: () => void;
  handleSaveLog: () => void;
}) {
  const uploadLabel = formData.goal === "loss" ? "Upload Your Meal" : formData.goal === "gain" ? "Upload Workout Photo" : "Upload Body Image";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <UploadBox label={uploadLabel} />
        <UploadBox label="Upload Health Report" />
      </div>
      <Button onClick={handleScan} disabled={isScanning} className="w-full h-16 text-lg rounded-xl">
        {isScanning ? "AI Analyzing..." : "Start AI Analysis"}
      </Button>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-8 text-center space-y-3"
        >
          <div className="text-gray-600 font-medium">Analyzing your data...</div>
          <div className="flex justify-center gap-1">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-green-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-green-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-green-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
      {scanResult && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-medium text-green-900 text-lg text-center">AI Analysis Complete</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Weight</div>
              <div className="text-2xl font-bold text-green-700">{scanResult.estimatedWeight} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Body Fat</div>
              <div className="text-2xl font-bold text-green-700">{scanResult.estimatedFat}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-green-700">{scanResult.validationScore}%</div>
            </div>
          </div>
        </motion.div>
      )}
      <Button onClick={handleSaveLog} className="w-full h-16 text-lg rounded-xl" disabled={!formData.weight || !formData.bloodSugar || !formData.systolic || !formData.diastolic}>
        Save & View Dashboard
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
      <button
        onClick={handleSaveLog}
        className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Skip AI Analysis
      </button>
    </div>
  );
}

export default function HealthTrackingPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])

  const [formData, setFormData] = useState<FormData>({
    goal: null,
    trackingFrequency: null,
    weight: "",
    bloodSugar: "",
    systolic: "",
    diastolic: "",
    mood: "Happy",
  })

  const currentStepData = steps[currentStep - 1]
  const progress = (currentStep / steps.length) * 100

  const handleInputChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleScan = async () => {
    setIsScanning(true)
    setTimeout(() => {
      setScanResult({
        estimatedWeight: 72.5,
        estimatedFat: 18.2,
        validationScore: 87,
      })
      setIsScanning(false)
    }, 2000)
  }

  const handleSaveLog = () => {
    if (!formData.weight || !formData.bloodSugar || !formData.systolic || !formData.diastolic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all health metrics before saving.",
        variant: "destructive",
      })
      return
    }

    const newLog: HealthLog = {
      date: new Date().toLocaleDateString(),
      weight: formData.weight,
      bloodSugar: formData.bloodSugar,
      bloodPressure: `${formData.systolic}/${formData.diastolic}`,
      mood: formData.mood,
      timestamp: Date.now(),
    }

    setHealthLogs([newLog, ...healthLogs])

    toast({
      title: "Success!",
      description: "Your health log has been saved.",
    })

    setCurrentStep(5)
  }

  const getTrend = (currentWeight: number, previousWeight: number | null): Trend => {
    if (!previousWeight) return "neutral"

    if (formData.goal === "loss") {
      return currentWeight < previousWeight ? "improving" : currentWeight > previousWeight ? "declining" : "neutral"
    } else if (formData.goal === "gain") {
      return currentWeight > previousWeight ? "improving" : currentWeight < previousWeight ? "declining" : "neutral"
    } else {
      const diff = Math.abs(currentWeight - previousWeight)
      return diff < 0.5 ? "neutral" : "declining"
    }
  }

  const getRelativeDate = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  if (currentStep === 5) {
    // Dashboard step - no progress bar
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-br from-teal-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-serif text-gray-900 text-center mb-4">NutriSense AI</h1>
            <h2 className="text-2xl font-medium text-gray-900 text-center mt-6">Your Health Dashboard</h2>
            <p className="text-sm text-gray-600 text-center">Track your progress and insights</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key="dashboard"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="w-full space-y-6"
              >
                {/* Health Log Timeline */}
                {healthLogs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="space-y-3">
                      {healthLogs.map((log, index) => {
                        const currentWeight = Number.parseFloat(log.weight)
                        const previousWeight =
                          index < healthLogs.length - 1 ? Number.parseFloat(healthLogs[index + 1].weight) : null
                        const trend = getTrend(currentWeight, previousWeight)

                        return (
                          <TimelineItem
                            key={log.timestamp}
                            date={getRelativeDate(log.timestamp)}
                            weight={currentWeight}
                            bloodSugar={Number.parseInt(log.bloodSugar)}
                            bloodPressure={log.bloodPressure}
                            mood={log.mood}
                            trend={trend}
                          />
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* AI Insights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-900">
                        Great start! Your{" "}
                        {formData.goal === "loss" ? "weight loss" : formData.goal === "gain" ? "weight gain" : "maintenance"} journey is
                        on track
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Minus className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-900">
                        Continue tracking{" "}
                        {formData.trackingFrequency === "daily"
                          ? "daily"
                          : formData.trackingFrequency === "weekly"
                          ? "weekly"
                          : "regularly"}{" "}
                        for better insights
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="shrink-0 mt-6 pb-4 flex flex-col items-center gap-4">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    goal: null,
                    trackingFrequency: null,
                    weight: "",
                    bloodSugar: "",
                    systolic: "",
                    diastolic: "",
                    mood: "Happy",
                  })
                  setScanResult(null)
                  setCurrentStep(3)
                }}
                className="flex-1 h-12 rounded-lg text-md"
              >
                Add New Entry
              </Button>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
        <div className="flex-1">
          {/* TOP SECTION */}
          <div className="mb-4">
            <h1 className="text-3xl font-serif text-gray-900 text-center mb-4">NutriSense AI</h1>
            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
              <motion.div
                className="bg-[#018075] h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Step {currentStep} of {steps.length}
            </p>
            <h2 className="text-2xl font-medium text-gray-900 text-center mt-6">
              {currentStepData.label}
            </h2>
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                {currentStep === 1 && (
                  <GoalSelect formData={formData} onInputChange={handleInputChange} />
                )}
                {currentStep === 2 && (
                  <FrequencySelect formData={formData} onInputChange={handleInputChange} />
                )}
                {currentStep === 3 && (
                  <MetricsInputs formData={formData} onInputChange={handleInputChange} />
                )}
                {currentStep === 4 && (
                  <AIAnalysisSection
                    formData={formData}
                    onInputChange={handleInputChange}
                    isScanning={isScanning}
                    scanResult={scanResult}
                    handleScan={handleScan}
                    handleSaveLog={handleSaveLog}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="shrink-0 mt-6 pb-4 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600 text-center max-w-xs">
            {currentStepData.description}
          </p>

          <div className="flex gap-3 w-full">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-lg text-md">
                Back
              </Button>
            )}

            <Button
              onClick={currentStep === steps.length ? handleSaveLog : handleNext}
              disabled={loading || (currentStep === 1 && !formData.goal) || (currentStep === 2 && !formData.trackingFrequency) || (currentStep === 3 && (!formData.weight || !formData.bloodSugar || !formData.systolic || !formData.diastolic))}
              className="flex-1 h-12 rounded-lg text-md"
            >
              {loading ? "Saving..." : currentStep === steps.length ? "Save & View Dashboard" : "Next"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}