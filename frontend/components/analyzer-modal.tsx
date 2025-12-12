/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendFoodAnalysisMessage } from "@/app/actions/chat";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Define BACKEND_API (use env var)
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || "";

interface AnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (
    userMessage: string,
    aiResponse: string,
    conversationId: string
  ) => void;
  userId: string;
}

export default function AnalyzerModal({
  isOpen,
  onClose,
  onSendToChat,
  userId,
}: AnalyzerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const analyzeAndSend = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert dataURL to File
      const file = dataURLToFile(selectedImage, `food-${Date.now()}.png`);
      const imageUrl = await uploadToSupabaseStorage(
        "food-images",
        file,
      );

      console.log("Uploaded Image URL:", imageUrl);
      // Prepare FormData for backend API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("diabetes", "true"); // Will be overridden in action with real profile
      formData.append("hypertension", "false");
      formData.append("ulcer", "false");
      formData.append("weight_loss", "false");

      // Call scan-food API
      const scanRes = await fetch(`${BACKEND_API}/scan-food/`, {
        method: "POST",
        body: formData,
      });

      if (!scanRes.ok) {
        throw new Error(`Scan failed: ${scanRes.statusText}`);
      }

      const scanOutput = await scanRes.json();
      console.log("Scan Output:", scanOutput);

      // Call new server action for food analysis message
      const { conversationId, assistantResponse } =
        await sendFoodAnalysisMessage(userId, userPrompt, scanOutput, imageUrl);

      const userMessage = `${userPrompt} [Food Image Attached]`;

      // Send to chat
      onSendToChat(userMessage, assistantResponse, conversationId);
      // Reset and close
      resetAnalysis();
      onClose();
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setShowCamera(false);
    setUserPrompt("Analyze this food");
    setError(null);
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
