/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  BarChart3,
  Apple,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react";

export default function AnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportType, setReportType] = useState("balanced");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const reportTypes = [
    {
      id: "balanced",
      label: "Balanced Diet",
      description: "Overall nutritional balance analysis",
      icon: Apple,
    },
    {
      id: "diabetes",
      label: "Diabetes Focus",
      description: "Glycemic index & carb management",
      icon: BarChart3,
    },
    {
      id: "detailed",
      label: "Detailed Report",
      description: "Comprehensive nutritional breakdown",
      icon: Sparkles,
    },
  ];

  const sampleReport = {
    foodName: "Mixed Vegetable Salad with Grilled Chicken",
    confidence: 92,
    nutritionalScore: 8.7,
    analysis: {
      carbohydrates: "15g (Low GI)",
      proteins: "28g",
      fats: "12g (Healthy fats)",
      fiber: "8g",
      sugars: "5g",
      calories: 320,
    },
    diabetesAnalysis: {
      glycemicIndex: "Low",
      recommendedPortion: "Full portion",
      bloodSugarImpact: "Minimal",
      insulinAdvice: "No additional insulin needed",
    },
    recommendations: [
      "Excellent choice for diabetes management",
      "High protein content supports satiety",
      "Low glycemic index vegetables",
      "Healthy fat sources from olive oil",
    ],
    warnings: ["None detected"],
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult(sampleReport);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisComplete(false);
    setAnalysisResult(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Food Analyzer</h1>
                <p className="text-sm text-gray-500">AI-powered nutritional analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Camera */}
          <div className="space-y-8">
            {/* Upload/Camera Tabs */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Capture Food</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Camera
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors hover:bg-gray-50"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">Click to upload image</p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </TabsContent>

                  <TabsContent value="camera" className="space-y-4">
                    {!selectedImage ? (
                      <>
                        <div className="relative bg-black rounded-xl overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <Button
                              onClick={capturePhoto}
                              size="lg"
                              className="rounded-full w-16 h-16 bg-white hover:bg-gray-100"
                            >
                              <div className="w-12 h-12 rounded-full border-4 border-primary" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={startCamera}
                          variant="outline"
                          className="w-full"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border">
                          <img 
                            src={selectedImage} 
                            alt="Captured" 
                            className="w-full h-64 object-cover"
                          />
                        </div>
                        <Button
                          onClick={resetAnalysis}
                          variant="outline"
                          className="w-full"
                        >
                          Retake Photo
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Report Type Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Report Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={reportType} 
                  onValueChange={setReportType}
                  className="space-y-4"
                >
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label 
                          htmlFor={type.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{type.label}</p>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
              size="lg"
              className="w-full py-6 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Food
                </>
              )}
            </Button>

            {selectedImage && !analysisComplete && (
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="w-full"
              >
                Clear Image
              </Button>
            )}
          </div>

          {/* Right Column - Report Display */}
          <div className="space-y-8">
            {analysisComplete && analysisResult ? (
              <>
                {/* Report Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {analysisResult.confidence}% Confidence
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Score: {analysisResult.nutritionalScore}/10
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Food Identification */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border">
                        {selectedImage && (
                          <img 
                            src={selectedImage} 
                            alt="Analyzed food" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {analysisResult.foodName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 font-medium">Verified by AI</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutritional Breakdown */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Nutritional Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(analysisResult.analysis).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {value as string}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Diabetes Specific Analysis */}
                {reportType === "diabetes" && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Diabetes Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(analysisResult.diabetesAnalysis).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                            <span className="text-gray-600">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium text-gray-900">
                              {value as string}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations & Warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-green-700">
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-amber-700">
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.warnings.map((warning: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                            <span className="text-gray-700">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  className="w-full"
                >
                  Analyze Another Food
                </Button>
              </>
            ) : (
              /* Placeholder/Instructions */
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Get Instant Food Analysis
                    </h3>
                    <p className="text-gray-600">
                      Upload or capture a photo of your food to get AI-powered nutritional analysis tailored to your dietary needs.
                    </p>
                  </div>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <span className="text-gray-700">Upload or take a photo of your food</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <span className="text-gray-700">Select your preferred report type</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <span className="text-gray-700">Get instant AI analysis and recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}