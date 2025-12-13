/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendFoodAnalysisMessage, createConversation } from "@/app/actions/chat";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Define BACKEND_API (use env var or fallback to production)
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || "https://nutrisense-ai-y5xx.onrender.com";

type PipelineStage = "idle" | "detecting" | "analyzing" | "insights";

type DetectionItem = {
  name?: string;
  confidence?: number;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  glycemic_index?: number;
  flags?: string[];
  source?: string;
};

type FinalResult = {
  detected_items: DetectionItem[];
  meal_summary?: Record<string, unknown>;
  recommendations?: Record<string, unknown>;
  raw?: {
    yolo?: unknown;
    flagship?: unknown;
  };
};

type ScanOutputItem = {
  name: string;
  confidence: number;
  calories: number;
  carbs: number;
  protein: number;
  fiber: number;
  glycemic_index: number;
  flags: string[];
  source: string;
};

type ScanOutput = {
  detected_items: ScanOutputItem[];
  meal_summary: {
    total_calories: number;
    score: number;
    quality: string;
    recommendations: string[];
  };
  recommendations: {
    healthy_alternatives: string[];
    portion_adjustments: string[];
  };
};

interface AnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (
    userMessage: string,
    aiResponse: string,
    conversationId: string
  ) => void;
  userId: string;
  conversationId?: string;
}

export default function AnalyzerModal({
  isOpen,
  onClose,
  onSendToChat,
  userId,
  conversationId,
}: AnalyzerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("Analyze this food");
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowCamera(false);
        stopCamera();
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Unable to access camera. Please try uploading an image.");
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
        setShowCamera(false);
        setError(null);
      }
    }
  };

  const dataURLToFile = (dataURL: string, filename: string): File => {
    const [prefix, base64Data] = dataURL.split(",");
    const mimeType = prefix.match(/:(.*?);/)?.[1] || "image/png";
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
  };

  const buildFormData = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Health flags: will be overridden downstream with real profile, kept for compatibility
    formData.append("diabetes", "true");
    formData.append("hypertension", "false");
    formData.append("ulcer", "false");
    formData.append("weight_loss", "false");
    formData.append("acid_reflux", "false");
    return formData;
  };

  const postImage = async (path: string, file: File) => {
    const formData = buildFormData(file);
    const url = `${BACKEND_API}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "omit",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
      }

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      console.error(`Request failed for ${path}:`, err);
      const message = err instanceof Error ? err.message : "Network/CORS error. Please retry.";
      throw new Error(message);
    }
  };

  const asArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (!value) return [];
    return [String(value)];
  };

  const analyzeAndSend = async () => {
    if (!selectedImage || !userId) return;

    setIsAnalyzing(true);
    setPipelineStage("analyzing");
    setStatusMessage("Analyzing meal…");
    setError(null);
    setFinalResult(null);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(userId);
      }

      // Convert dataURL to File
      const file = dataURLToFile(selectedImage, `food-${Date.now()}.png`);
      const imageUrl = await uploadToSupabaseStorage(
        "food-images",
        file,
      );

      // Single call: Advanced YOLO + Mistral endpoint (server-side fallback enabled)
      const apiResult = await postImage("/scan-food-yolo-mistral/", file) as Record<string, unknown>;
      
      // Extract detected items
      const extractedItems = apiResult && typeof apiResult === 'object' && 'detected_items' in apiResult
        ? (apiResult.detected_items as DetectionItem[])
        : [];
      
      // Prefer flagship analysis embedded by server if present
      const flagship = apiResult && typeof apiResult === 'object' && 'flagship' in apiResult
        ? (apiResult.flagship as Record<string, unknown>)
        : undefined;
      const mealSummary = (flagship?.meal_summary || apiResult?.meal_summary || apiResult?.mealSummary || {}) as Record<string, unknown>;
      const recommendations = (flagship?.recommendations || apiResult?.recommendations || {}) as Record<string, unknown>;

      const combined: FinalResult = {
        detected_items: extractedItems,
        meal_summary: mealSummary,
        recommendations: recommendations,
        raw: {
          yolo: apiResult,
          flagship,
        },
      };

      setFinalResult(combined);

      // Step 4: Normalize to ScanOutput format for chat
      const normalizedForChat: ScanOutput = {
        detected_items: combined.detected_items.map(item => ({
          name: item.name || "Unknown",
          confidence: item.confidence || 0,
          calories: item.calories || 0,
          carbs: item.carbs || 0,
          protein: item.protein || 0,
          fiber: item.fiber || 0,
          glycemic_index: item.glycemic_index || 0,
          flags: item.flags || [],
          source: item.source || "detection",
        })),
        meal_summary: {
          total_calories: Number(combined.meal_summary?.total_calories || 0),
          score: Number(combined.meal_summary?.score || 0),
          quality: String(combined.meal_summary?.quality || "Unknown"),
          recommendations: asArray(combined.meal_summary?.recommendations),
        },
        recommendations: {
          healthy_alternatives: asArray(combined.recommendations?.healthy_alternatives),
          portion_adjustments: asArray(combined.recommendations?.portion_adjustments),
        },
      };

      // Step 5: Send to chat with insights
      setPipelineStage("insights");
      setStatusMessage("Generating insights…");
      const { assistantResponse } = await sendFoodAnalysisMessage(
        userId,
        convId,
        userPrompt,
        normalizedForChat,
        imageUrl
      );

      // Show completion modal instead of closing
      setShowCompletion(true);
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const errMessage = err instanceof Error ? err.message : String(err);
      const message = errMessage.toLowerCase().includes("cors")
        ? "Network/CORS issue. Please retry or check backend URL."
        : errMessage || "Failed to analyze image. Please try again.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
      setPipelineStage("idle");
      setStatusMessage(null);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setShowCamera(false);
    setUserPrompt("Analyze this food");
    setError(null);
    setFinalResult(null);
    setPipelineStage("idle");
    setStatusMessage(null);
    setShowCompletion(false);
    setShowQuickSummary(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetAnalysis();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
           <DialogTitle>Scan Food with AI</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Upload/Camera Section */}
          {!selectedImage && !showCamera ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium">Upload Image</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowCamera(true);
                  startCamera();
                }}
                variant="outline"
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take a Photo
              </Button>
            </div>
          ) : showCamera ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
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
                  Restart Camera
                </Button>
              </div>
            </div>
          ) : (
            // Preview and Prompt Section
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img
                    src={selectedImage ?? ""}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Food image ready for analysis</p>
                  <p className="text-sm text-gray-500">
                    Add a prompt to guide the analysis
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Prompt</label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full h-20 p-3 border rounded-lg resize-none"
                  placeholder="Describe what you'd like me to analyze about this food..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedImage && (
              <Button
                variant="outline"
                onClick={resetAnalysis}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            <Button
              onClick={analyzeAndSend}
              disabled={!selectedImage || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {statusMessage || "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Send to Chat
                </>
              )}
            </Button>
          </div>

          {(isAnalyzing || statusMessage) && (
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-700 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{statusMessage || "Working..."}</p>
                <p className="text-sm text-gray-600">
                  {pipelineStage === "analyzing"
                    ? "Analyzing meal…"
                    : pipelineStage === "insights"
                      ? "Generating insights…"
                      : "Processing…"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Completion Modal */}
      <Dialog open={showCompletion} onOpenChange={(open) => {
        if (!open) {
          setShowCompletion(false);
          onSendToChat(`${userPrompt} [Food Image Attached]`, "", conversationId || "");
          resetAnalysis();
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            {/* Success Message */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                Analysis Complete!
              </h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Your meal has been successfully analyzed. The results have been sent to your chat.
              </p>
            </div>

            {/* Quick Stats */}
            {finalResult?.meal_summary && (
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">
                    {finalResult.detected_items.length}
                  </p>
                  <p className="text-xs text-blue-600">Items</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 text-center border border-amber-200">
                  <p className="text-2xl font-bold text-amber-700">
                    {String(finalResult.meal_summary?.total_calories || 0)}
                  </p>
                  <p className="text-xs text-amber-600">kcal</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 text-center border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-700">
                    {Math.round(Number(finalResult.meal_summary?.score || 0))}
                  </p>
                  <p className="text-xs text-emerald-600">Score</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={() => {
                  setShowCompletion(false);
                  setShowQuickSummary(true);
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Quick Summary
              </Button>
              <Button
                onClick={() => {
                  setShowCompletion(false);
                  onSendToChat(`${userPrompt} [Food Image Attached]`, "", conversationId || "");
                  resetAnalysis();
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                Go to Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Summary Modal */}
      <Dialog open={showQuickSummary} onOpenChange={(open) => {
        if (!open) {
          setShowQuickSummary(false);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Nutrition Summary
            </DialogTitle>
          </DialogHeader>

          {finalResult && (
            <div className="space-y-6">
              {/* Nutrition Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    🥗
                  </div>
                  Meal Nutrition
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="shadow-sm border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Energy & Macros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Calories</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_calories ?? "—")} kcal</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Carbs</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_carbs ?? "—")} g</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Protein</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_protein ?? "—")} g</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Fat</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_fat ?? "—")} g</p>
                        </div>
                      </div>
                      {finalResult.meal_summary?.score !== undefined && finalResult.meal_summary?.score !== null && (
                        <div className="pt-2">
                          <p className="text-xs text-gray-500 mb-1">Meal score</p>
                          <Progress value={Number(finalResult.meal_summary.score)} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1 text-right">
                            {Math.round(Number(finalResult.meal_summary.score))}/100
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Health Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Glycemic Load</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.glycemic_load ?? "—")}</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Fiber</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_fiber ?? "—")} g</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Sodium</p>
                          <p className="font-semibold">{String(finalResult.meal_summary?.total_sodium ?? "—")} mg</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500">Quality</p>
                          <Badge variant="outline" className="font-semibold">
                            {String(finalResult.meal_summary?.quality ?? "—")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    ✨
                  </div>
                  AI Recommendations
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {asArray(finalResult.recommendations?.healthy_alternatives).length > 0 && (
                    <Card className="shadow-sm border-emerald-200 bg-emerald-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-emerald-700">Healthy Alternatives</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-800">
                        {asArray(finalResult.recommendations?.healthy_alternatives).map((alt, idx) => (
                          <div key={`alt-${idx}`} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            <span>{alt}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {asArray(finalResult.recommendations?.portion_adjustments).length > 0 && (
                    <Card className="shadow-sm border-blue-200 bg-blue-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-blue-700">Portion Guidance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-800">
                        {asArray(finalResult.recommendations?.portion_adjustments).map((alt, idx) => (
                          <div key={`portion-${idx}`} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                            <span>{alt}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {asArray(finalResult.recommendations?.what_to_add || finalResult.recommendations?.additions).length > 0 && (
                    <Card className="shadow-sm border-amber-200 bg-amber-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-amber-700">What to Add</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-800">
                        {asArray(finalResult.recommendations?.what_to_add || finalResult.recommendations?.additions).map((alt, idx) => (
                          <div key={`add-${idx}`} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                            <span>{alt}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => {
                  setShowQuickSummary(false);
                  onSendToChat(`${userPrompt} [Food Image Attached]`, "", conversationId || "");
                  resetAnalysis();
                  onClose();
                }}
                className="w-full"
              >
                Continue to Chat
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// Helper for storage upload (lib/storage.ts)
export async function uploadToSupabaseStorage(
  bucket: string,
  file: File,
): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`private/${file.name}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}