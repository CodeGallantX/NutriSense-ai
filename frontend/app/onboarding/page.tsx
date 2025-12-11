"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const dietaryOptions = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", "Dairy-Free", "Pescatarian"]
const cuisineOptions = [
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "Japanese",
  "Thai",
  "Mediterranean",
  "American",
  "Middle Eastern",
  "Korean",
]
const healthConditions = [
  "Type 2 Diabetes",
  "Type 1 Diabetes",
  "Prediabetes",
  "Hypertension",
  "High Cholesterol",
  "Heart Disease",
  "Celiac Disease",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Form state
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [gender, setGender] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [monthlyBudget, setMonthlyBudget] = useState("")
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [allergies, setAllergies] = useState("")
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [hasDiabetes, setHasDiabetes] = useState(false)
  const [diabetesType, setDiabetesType] = useState("")
  const [targetBSMin, setTargetBSMin] = useState("")
  const [targetBSMax, setTargetBSMax] = useState("")

  const handleDietaryToggle = (option: string) => {
    setSelectedDietary((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const handleCuisineToggle = (option: string) => {
    setSelectedCuisines((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const handleConditionToggle = (condition: string) => {
    const isDiabetes = condition.toLowerCase().includes("diabetes")
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((item) => item !== condition) : [...prev, condition],
    )

    if (isDiabetes && !selectedConditions.includes(condition)) {
      setHasDiabetes(true)
      if (condition === "Type 2 Diabetes") setDiabetesType("type2")
      else if (condition === "Type 1 Diabetes") setDiabetesType("type1")
      else if (condition === "Prediabetes") setDiabetesType("prediabetes")
    } else if (isDiabetes && selectedConditions.includes(condition)) {
      const hasOtherDiabetes = selectedConditions.some((c) => c !== condition && c.toLowerCase().includes("diabetes"))
      if (!hasOtherDiabetes) {
        setHasDiabetes(false)
        setDiabetesType("")
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/signin")
      return
    }

    const allergiesArray = allergies
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a)

    const { error } = await supabase
      .from("profiles")
      .update({
        age: age ? Number.parseInt(age) : null,
        weight_kg: weight ? Number.parseFloat(weight) : null,
        height_cm: height ? Number.parseFloat(height) : null,
        gender: gender || null,
        activity_level: activityLevel || null,
        dietary_preferences: selectedDietary.length > 0 ? selectedDietary : null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        health_conditions: selectedConditions.length > 0 ? selectedConditions : null,
        monthly_budget_usd: monthlyBudget ? Number.parseFloat(monthlyBudget) : null,
        cultural_cuisine_preferences: selectedCuisines.length > 0 ? selectedCuisines : null,
        has_diabetes: hasDiabetes,
        diabetes_type: diabetesType || null,
        target_blood_sugar_min: targetBSMin ? Number.parseInt(targetBSMin) : null,
        target_blood_sugar_max: targetBSMax ? Number.parseInt(targetBSMax) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-teal-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Step {step} of 3 - Help us personalize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (physical job or 2x training)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dietary Preferences & Health</h3>

              <div className="space-y-2">
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={selectedDietary.includes(option)}
                        onCheckedChange={() => handleDietaryToggle(option)}
                      />
                      <label htmlFor={option} className="text-sm cursor-pointer">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  placeholder="peanuts, shellfish, soy"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Health Conditions</Label>
                <div className="grid grid-cols-1 gap-3">
                  {healthConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => handleConditionToggle(condition)}
                      />
                      <label htmlFor={condition} className="text-sm cursor-pointer">
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {hasDiabetes && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Diabetes Management Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetBSMin">Target Blood Sugar Min (mg/dL)</Label>
                      <Input
                        id="targetBSMin"
                        type="number"
                        placeholder="80"
                        value={targetBSMin}
                        onChange={(e) => setTargetBSMin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetBSMax">Target Blood Sugar Max (mg/dL)</Label>
                      <Input
                        id="targetBSMax"
                        type="number"
                        placeholder="130"
                        value={targetBSMax}
                        onChange={(e) => setTargetBSMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Budget & Cuisine Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Monthly Food Budget (USD)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  step="0.01"
                  placeholder="300"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Cuisines</Label>
                <div className="grid grid-cols-2 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={selectedCuisines.includes(cuisine)}
                        onCheckedChange={() => handleCuisineToggle(cuisine)}
                      />
                      <label htmlFor={cuisine} className="text-sm cursor-pointer">
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
