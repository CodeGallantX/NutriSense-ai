/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import AnalyzerModal from "@/components/analyzer-modal";
import {
  getUserProfile,
  sendUserMessage,
  createConversation,
} from "@/app/actions/chat";
import { Profile } from "@/types/database";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DashboardLanding() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | "">("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      image_url?: string;
      created_at: string;
    }>
  >([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [conversationId, setConversationId] = useState<string>(""); 
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message for typing effect
  const initialMessage = "Hello! I'm your diabetes health assistant. I can help you track meals, analyze nutrition, and manage your blood sugar levels. How can I assist you today?";

  // Fetch user on mount
  useEffect(() => {
    const checkUserAndOnboarding = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setUserId("demo-user");
        return;
      }

      const uid = data.user.id;
      setUserId(uid);

      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);

      // Redirect to onboarding if not completed
      if (!userProfile?.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }

    };

    checkUserAndOnboarding();
  }, [supabase, router]);

  // Fetch profile and show initial message when userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || hasInitialized) return;

      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);

      // Always show initial typing effect on landing (no real conv yet)
      setIsTyping(true);
      let index = 0;
      const tempId = "initial-msg";
      
      // Start with empty message
      setMessages([{
        id: tempId,
        role: "assistant" as const,
        content: "",
        created_at: new Date().toISOString(),
      }]);

      // Type out the initial message
      const timer = setInterval(() => {
        if (index < initialMessage.length) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? { ...msg, content: initialMessage.slice(0, index + 1) }
                : msg
            )
          );
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 30);
      
      setHasInitialized(true);
    };

    fetchData();
  }, [userId, hasInitialized, initialMessage]);

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

  const handleSend = async () => {
    if (!input.trim() || !userId || conversationId) return; 
    const content = input;
    setInput("");

    // Create conversation first
    const newConvId = await createConversation(userId);
    setConversationId(newConvId);

    // Add optimistic user message (local only, will redirect)
    const tempUserMsgId = `temp-user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: tempUserMsgId,
        role: "user" as const,
        content,
        created_at: new Date().toISOString(),
      },
    ]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send message to new conv and get response
      const { assistantResponse } = await sendUserMessage(userId, newConvId, content);
      
      // Since we're redirecting, no need for typing effect here
      // Redirect to new chat page
      router.push(`/dashboard/${newConvId}`);
    } catch (err) {
      console.error("Send error:", err);
      setIsTyping(false);
      setConversationId(""); // Reset
      // Remove temp user msg
      setMessages(prev => prev.filter(m => m.id !== tempUserMsgId));
      // Optionally show error
    }
  };

  const handleSendToChat = async (
    userMessage: string,
    aiResponse: string,
    convId: string
  ) => {
    setConversationId(convId);
    // Redirect to chat
    router.push(`/dashboard/${convId}`);
    setShowAnalyzer(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const isReadyToSend = !conversationId && !isTyping;

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-blue-50 flex flex-col">
      {/* Top Section - Centered Heading (shown on landing) */}
      <div className="shrink-0 py-12 px-4 text-center border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl text-foreground mb-3 text-balance font-serif">
            Manage Your Health Journey
          </h1>
          <p className="text-muted-foreground text-base md:text-lg text-pretty">
            Track your nutrition, scan meals with AI, and get personalized
            insights for better diabetes management.
          </p>
        </div>
      </div>

      {/* Middle Section - Chat Interface (same as chat page) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          <div className="max-w-3xl mx-auto space-y-4 pb-24">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                    {/* Show typing cursor for the last assistant message if typing */}
                    {message.role === "assistant" && 
                     index === messages.length - 1 && 
                     isTyping && 
                     message.id?.startsWith('temp-') && (
                      <span className="animate-pulse">|</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Separate typing indicator for non-message typing */}
            {isTyping && messages.length > 0 && 
             messages[messages.length - 1].role === "user" && (
              <div className="flex justify-start animate-in fade-in-50">
                <div className="max-w-[75%] rounded-xl p-3 bg-white border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Section with Input and Options (same as chat) */}
        <div
          className={`fixed bottom-0 left-0 right-0 w-full bg-linear-to-t from-white via-white to-transparent pt-4 pb-6 transition-all duration-300 ${
            isScrolled ? "shadow-lg" : ""
          }`}
        >
          {/* Feature Action Buttons */}
          <div className="w-full max-w-3xl px-4">
            <div
              className="flex items-center gap-3 overflow-x-auto pb-3 
              scrollbar-hide 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:none] 
              [scrollbar-width:none]
              hover:overflow-x-auto
              active:overflow-x-auto
              touch-pan-x"
            >
              <Button
                onClick={() => setShowAnalyzer(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Scan Food</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <Utensils className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Meal Planner</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Blood Sugar</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Calculator</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
                disabled={!isReadyToSend}
              >
                <Apple className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Food Database</span>
              </Button>
            </div>
          </div>

          {/* Bottom Input */}
          <div className="w-full max-w-3xl px-4">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isReadyToSend && handleSend()}
                placeholder="Ask about nutrition, meals, or diabetes management..."
                className="w-full rounded-lg shadow-none pl-16 pr-16 py-7 text-base focus-visible:ring-primary bg-white border border-gray-200 focus:border-primary"
                disabled={!isReadyToSend || isTyping}
              />

              {/* Left icon inside input */}
              <Button
                onClick={handleImageUpload}
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 hover:bg-gray-100"
                disabled={!isReadyToSend || isTyping}
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
              </Button>

              {/* Right icon inside input */}
              <Button
                onClick={handleSend}
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-lg h-9 w-9 bg-primary hover:bg-primary/90"
                disabled={!isReadyToSend || !input.trim() || isTyping}
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

      {/* Analyzer Modal - On landing, will create conv on send */}
      <AnalyzerModal
        isOpen={showAnalyzer}
        onClose={() => setShowAnalyzer(false)}
        onSendToChat={handleSendToChat}
        userId={userId}
        conversationId={conversationId}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && userId && !conversationId) {
            // On landing, create conv first
            const newId = await createConversation(userId);
            router.push(`/dashboard/${newId}`);
          }
        }}
      />
    </div>
  );
}