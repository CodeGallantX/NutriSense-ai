/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react"
import { analyzeFoodImage, saveFoodLog } from "./actions"
import Link from "next/link"
import Image from "next/image"

interface AnalysisResult {
  foodName: string
  description: string
  ingredients: string[]
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  glycemicIndex: number
  glycemicLoad: number
  predictedBloodSugarSpike: number
  portionSize: string
  estimatedCost: number
  healthScore: number
  recommendations: string[]
}

export default function AnalyzerPage() {
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [mealType, setMealType] = useState("lunch")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setAnalysis(null)
      setSaved(false)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return

    setAnalyzing(true)
    try {
      const result = await analyzeFoodImage(image)
      setAnalysis(result)
    } catch (error) {
      console.error("Analysis error:", error)
      alert("Failed to analyze image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!analysis) return

    setSaving(true)
    try {
      await saveFoodLog({
        mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
        foodName: analysis.foodName,
        description: analysis.description,
        imageUrl: image,
        calories: analysis.nutrition.calories,
        protein: analysis.nutrition.protein,
        carbs: analysis.nutrition.carbs,
        fat: analysis.nutrition.fat,
        fiber: analysis.nutrition.fiber,
        sugar: analysis.nutrition.sugar,
        sodium: analysis.nutrition.sodium,
        glycemicIndex: analysis.glycemicIndex,
        glycemicLoad: analysis.glycemicLoad,
        predictedBloodSugarSpike: analysis.predictedBloodSugarSpike,
        portionSize: analysis.portionSize,
        costUsd: analysis.estimatedCost,
        notes: additionalNotes,
      })
      setSaved(true)
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save food log. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">AI Food Analyzer</h1>
            <p className="text-gray-600">Scan your meal for instant nutritional insights</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Food Image</CardTitle>
              <CardDescription>Take a photo or upload an image of your meal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!image ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Capture or upload your meal</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => cameraInputRef.current?.click()} variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image src={image || "/placeholder.svg"} alt="Food" fill className="object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setImage(null)
                        setImageFile(null)
                        setAnalysis(null)
                        setSaved(false)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <Button onClick={handleAnalyze} disabled={analyzing} className="flex-1">
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Food"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>Nutritional breakdown and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Upload an image and click analyze to see results</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Food Details */}
                  <div>
                    <h3 className="font-bold text-xl text-teal-700">{analysis.foodName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{analysis.description}</p>
                  </div>

                  {/* Nutrition Facts */}
                  <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2 border-b-8 border-gray-900 pb-1">Nutrition Facts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-bold text-base border-b border-gray-400 pb-1">
                        <span>Calories</span>
                        <span>{Math.round(analysis.nutrition.calories)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-300">
                        <span>Protein</span>
                        <span className="font-semibold">{analysis.nutrition.protein.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-300">
                        <span>Carbohydrates</span>
                        <span className="font-semibold">{analysis.nutrition.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-300">
                        <span>Fat</span>
                        <span className="font-semibold">{analysis.nutrition.fat.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-300">
                        <span>Fiber</span>
                        <span className="font-semibold">{analysis.nutrition.fiber.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-300">
                        <span>Sugar</span>
                        <span className="font-semibold">{analysis.nutrition.sugar.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sodium</span>
                        <span className="font-semibold">{Math.round(analysis.nutrition.sodium)}mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Glycemic Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Glycemic Index</p>
                      <p className="text-2xl font-bold text-blue-700">{analysis.glycemicIndex}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Glycemic Load</p>
                      <p className="text-2xl font-bold text-purple-700">{analysis.glycemicLoad.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Blood Sugar Prediction */}
                  {analysis.predictedBloodSugarSpike > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-900">Predicted Blood Sugar Spike</p>
                      <p className="text-2xl font-bold text-red-700">+{analysis.predictedBloodSugarSpike} mg/dL</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Portion Size</p>
                      <p className="font-semibold">{analysis.portionSize}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Est. Cost</p>
                      <p className="font-semibold">${analysis.estimatedCost.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Health Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analysis.healthScore}%` }} />
                      </div>
                      <span className="font-bold text-green-700">{analysis.healthScore}/100</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-teal-600 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Save Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional details..."
                        value={additionalNotes}
                        onChange={(e: any) => setAdditionalNotes(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Button onClick={handleSave} disabled={saving || saved} className="w-full">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Saved Successfully
                        </>
                      ) : (
                        "Save to Food Log"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
