/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface AnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (userMessage: string, aiResponse: string) => void;
}

export default function AnalyzerModal({ isOpen, onClose, onSendToChat }: AnalyzerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userPrompt, setUserPrompt] = useState("Analyze this food");
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
        setShowCamera(false);
      }
    }
  };

  const analyzeAndSend = () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const aiResponse = `I've analyzed your food image. Here's what I found:

**Identified Food:** Mixed Vegetable Salad with Grilled Chicken

**Nutritional Breakdown:**
• Carbohydrates: 15g (Low Glycemic Index)
• Proteins: 28g (High Quality)
• Fats: 12g (Healthy Fats)
• Dietary Fiber: 8g (Excellent Source)
• Calories: 320 (Moderate)

**Diabetes Analysis:**
✓ Low Glycemic Impact
✓ Minimal Blood Sugar Spike
✓ Excellent Protein Content for Satiety

**Recommendations:**
1. This is an excellent choice for diabetes management
2. Consider adding a small portion of whole grains
3. Drink plenty of water with this meal`;

      const userMessage = userPrompt + " [Food Image Attached]";
      
      // Send to chat
      onSendToChat(userMessage, aiResponse);
      
      // Reset and close
      setIsAnalyzing(false);
      resetAnalysis();
      onClose();
    }, 2000);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setShowCamera(false);
    setUserPrompt("Analyze this food");
    stopCamera();
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
            <h2 className="text-xl font-bold">Scan Food with AI</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload/Camera Section */}
          {!selectedImage && !showCamera ? (
            <div className="space-y-4">
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Send to Chat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}