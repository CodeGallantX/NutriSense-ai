"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Camera,
  TrendingUp,
  Utensils,
  Activity,
  Apple,
  Calculator,
  Upload,
  Send,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialMessage =
    "Hello! I'm your diabetes health assistant. I can help you track meals, analyze nutrition, and manage your blood sugar levels. How can I assist you today?";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < initialMessage.length) {
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === 0
              ? { ...msg, content: initialMessage.slice(0, index + 1) }
              : msg
          )
        );
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop } = chatContainerRef.current;
        setIsScrolled(scrollTop > 10);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I understand you're asking about that. Let me help you with personalized health insights based on your diabetes management needs.",
        },
      ]);
    }, 1000);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-blue-50 flex flex-col">
      {/* Top Section - Centered Heading */}
      <div className="shrink-0 py-12 px-4 text-center border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl text-foreground mb-3 text-balance font-serif">
            Manage Your Diabetes Health Journey
          </h1>
          <p className="text-muted-foreground text-base md:text-lg text-pretty">
            Track your nutrition, scan meals with AI, and get personalized
            insights for better diabetes management.
          </p>
        </div>
      </div>

      {/* Middle Section - Chat Interface */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Chat Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          <div className="max-w-3xl mx-auto space-y-4 pb-24">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in-50 duration-500 slide-in-from-bottom-2`}
              >
                <div
                  className={`
            max-w-[85%] md:max-w-[75%]
            rounded-xl
            p-3
            ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-white text-gray-900 border border-gray-100"
            }
          `}
                >
                  <p className="text-sm leading-relaxed">
                    {message.content}
                    {message.role === "assistant" &&
                      index === 0 &&
                      isTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom Section with Input and Options */}
        <div className={`sticky bottom-0 bg-linear-to-t from-white via-white to-transparent pt-4 pb-6 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : ''
        }`}>
          {/* Feature Action Buttons - Sticky above input with hidden scrollbar */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-3 
              scrollbar-hide 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:none] 
              [scrollbar-width:none]
              hover:overflow-x-auto
              active:overflow-x-auto
              touch-pan-x"
            >
              <Button
                onClick={handleImageUpload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Scan Food</span>
              </Button>

              <Link href="/meals">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                >
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Meal Planner</span>
                </Button>
              </Link>

              <Link href="/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                >
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Analytics</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Blood Sugar</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Calculator</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <Apple className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Food Database</span>
              </Button>
            </div>
          </div>

          {/* Bottom Input */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about nutrition, meals, or diabetes management..."
                className="w-full rounded-lg shadow-none pl-16 pr-16 py-7 text-base focus-visible:ring-primary bg-white border border-gray-200 focus:border-primary"
              />

              {/* Left icon inside input */}
              <Button
                onClick={handleImageUpload}
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 hover:bg-gray-100"
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
              </Button>

              {/* Right icon inside input */}
              <Button
                onClick={handleSend}
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-lg h-9 w-9 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          By using this app, you agree that we may use your health data to
          provide personalized recommendations and improve our services in
          accordance with our Privacy Policy. We maintain strict confidentiality
          and security standards for all health information.
        </p>
      </div>
    </div>
  );
}