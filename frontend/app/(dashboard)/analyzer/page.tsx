/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  BarChart3,
  Apple,
  Download,
  ChevronLeft,
  Scale,
  Dumbbell,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function AnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [reportType, setReportType] = useState("balanced");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
    {
      id: "weightloss",
      label: "Weight Loss",
      description: "Calorie deficit & metabolism boost",
      icon: Scale,
    },
    {
      id: "muscle",
      label: "Muscle Building",
      description: "High protein & recovery focus",
      icon: Dumbbell,
    },
    {
      id: "heart",
      label: "Heart Healthy",
      description: "Low sodium & omega-3 rich",
      icon: Heart,
    },
  ];

  const sampleReport = {
    title: "AI NUTRITION ANALYSIS REPORT",
    foodName: "MIXED VEGETABLE SALAD WITH GRILLED CHICKEN",
    confidence: 92,
    nutritionalScore: 8.7,
    summary:
      "EXCELLENT CHOICE FOR DIABETES MANAGEMENT. THIS MEAL PROVIDES A BALANCED COMBINATION OF LEAN PROTEIN, HEALTHY FATS, AND LOW-GLYCEMIC VEGETABLES.",

    analysis: [
      { label: "CARBOHYDRATES", value: "15g", note: "(LOW GLYCEMIC INDEX)" },
      { label: "PROTEINS", value: "28g", note: "(HIGH QUALITY)" },
      { label: "FATS", value: "12g", note: "(HEALTHY FATS)" },
      { label: "DIETARY FIBER", value: "8g", note: "(EXCELLENT SOURCE)" },
      { label: "SUGARS", value: "5g", note: "(NATURAL SOURCES)" },
      { label: "CALORIES", value: "320", note: "(MODERATE)" },
    ],

    diabetesAnalysis: [
      { label: "GLYCEMIC INDEX", value: "LOW" },
      { label: "BLOOD SUGAR IMPACT", value: "MINIMAL" },
      { label: "RECOMMENDED PORTION", value: "FULL PORTION" },
      { label: "INSULIN ADVICE", value: "NO ADDITIONAL NEEDED" },
    ],

    recommendations: [
      "EXCELLENT CHOICE FOR DIABETES MANAGEMENT",
      "HIGH PROTEIN CONTENT SUPPORTS SATIETY",
      "LOW GLYCEMIC INDEX VEGETABLES",
      "HEALTHY FAT SOURCES FROM OLIVE OIL",
      "CONSIDER ADDING A SMALL PORTION OF WHOLE GRAINS",
    ],

    warnings: ["NONE DETECTED"],
  };

  const simulateTyping = (text: string, speed = 30) => {
    setIsTyping(true);
    setDisplayText("");
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
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
      stopCamera(); // Stop existing stream first
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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
        setShowCamera(false); // Hide camera interface
      }
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisComplete(true);

    // Start typing animation for title
    simulateTyping(sampleReport.title + "\n\n");

    // Simulate AI analysis with progressive typing
    setTimeout(() => {
      const fullReport = `
${sampleReport.title}

IDENTIFIED FOOD: ${sampleReport.foodName}

SUMMARY:
${sampleReport.summary}

NUTRITIONAL BREAKDOWN:
${sampleReport.analysis
  .map((item) => `${item.label}: ${item.value} ${item.note}`)
  .join("\n")}

DIABETES ANALYSIS:
${sampleReport.diabetesAnalysis
  .map((item) => `${item.label}: ${item.value}`)
  .join("\n")}

RECOMMENDATIONS:
${sampleReport.recommendations.join("\n")}

WARNINGS:
${sampleReport.warnings.join("\n")}
      `.trim();

      simulateTyping(fullReport);

      setTimeout(() => {
        setAnalysisResult(sampleReport);
        setIsAnalyzing(false);
      }, 2000);
    }, 1000);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisComplete(false);
    setAnalysisResult(null);
    setDisplayText("");
    setIsTyping(false);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Centered Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-3">
            AI Food Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Upload or capture food images for instant nutritional analysis and
            personalized recommendations
          </p>
        </div>

        {!analysisComplete ? (
          /* UPLOAD SECTION - CENTERED */
          <div className="space-y-8">
            {/* Upload/Camera Section */}
            <div className="max-w-md mx-auto">
              {/* Upload Option - Hidden when camera is shown */}
              {!showCamera && (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors hover:bg-gray-50"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      Upload Image
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />

                  {/* OR Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Take Photo Button */}
                  <Button
                    onClick={() => {
                      setShowCamera(true);
                      startCamera();
                    }}
                    variant="outline"
                    className="w-full py-8 text-lg"
                  >
                    <Camera className="w-6 h-6 mr-2" />
                    Take a Photo
                  </Button>
                </>
              )}

              {/* Camera Interface - Only shown when showCamera is true */}
              {showCamera && (
                <div className="space-y-4">
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

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowCamera(false);
                        stopCamera();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Restart Camera
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Image Preview - Shown when image is selected */}
              {selectedImage && !showCamera && (
                <div className="mt-8 pt-8 border-t text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Image ready for analysis</p>
                      <p className="text-sm text-gray-500">
                        Click analyze below
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Report Type Selection - Centered Below Upload - Only show when image selected */}
            {selectedImage && !showCamera && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-6">
                  Select Report Type
                </h2>
                <RadioGroup
                  value={reportType}
                  onValueChange={setReportType}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto"
                >
                  {reportTypes.map((type) => {
                    const isSelected = reportType === type.id;
                    return (
                      <div key={type.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label
                          htmlFor={type.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div
                            className={`p-4 rounded-lg transition-colors ${
                              isSelected
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">
                                {type.label}
                              </p>
                              <p className="text-sm text-gray-500">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Analyze Button - Centered */}
            <div className="text-center">
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
            </div>
          </div>
        ) : (
          /* GENERATION SECTION - TYPING ANIMATION */
          <div className="space-y-8">
            {/* Food Preview */}
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden border shadow">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Analyzed food"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold">Food Analyzed</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {analysisResult?.foodName || "Analyzing..."}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                  Confidence: {analysisResult?.confidence || 92}%
                </div>
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                  Score: {analysisResult?.nutritionalScore || 8.7}/10
                </div>
              </div>
            </div>

            {/* Typing Report Display */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="border-b p-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Analysis Report
                </h2>
                <p className="text-gray-600">
                  Generating your personalized analysis...
                </p>
              </div>

              <div className="p-8">
                <div className="font-mono whitespace-pre-wrap text-gray-800 min-h-[400px] leading-relaxed">
                  {displayText}
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse align-middle"></span>
                  )}
                </div>

                {!isTyping && analysisResult && (
                  <div className="mt-8 pt-8 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recommendations */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">
                          Key Recommendations
                        </h3>
                        <ul className="space-y-3">
                          {analysisResult.recommendations
                            .slice(0, 3)
                            .map((rec: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-gray-700">{rec}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Quick Stats */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">
                          Quick Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {analysisResult.analysis
                            .slice(0, 4)
                            .map((item: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                                  {item.label}
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                  {item.value}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center mt-8 pt-6 border-t">
                      <Button onClick={resetAnalysis} variant="outline">
                        Analyze Another Food
                      </Button>
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isTyping && (
              <div className="text-center text-gray-500">
                <p>AI is analyzing your food... This may take a moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}