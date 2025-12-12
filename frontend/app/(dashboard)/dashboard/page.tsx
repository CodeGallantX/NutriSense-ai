/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
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
  getOrCreateConversation,
  getConversationMessages,
} from "@/app/actions/chat";
import { Profile } from "@/types/database";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
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
  const [conversationId, setConversationId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message for typing effect
  const initialMessage = "Hello! I'm your diabetes health assistant. I can help you track meals, analyze nutrition, and manage your blood sugar levels. How can I assist you today?";

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setUserId("demo-user");
      } else {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, [supabase]);

  // Fetch profile, conversation, messages when userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || hasInitialized) return;

      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);

      if (userProfile?.has_diabetes) {
        const convId = await getOrCreateConversation(userId);
        setConversationId(convId);
        const convMessages = await getConversationMessages(convId);
        
        if (convMessages.length === 0) {
          // If no messages, show initial typing effect
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
              
              // Save the initial message to database
              setTimeout(async () => {
                await sendUserMessage(userId, "Start chat", undefined);
              }, 500);
            }
          }, 30);
        } else {
          // If we have existing messages, show them
          setMessages(convMessages);
        }
      } else {
        // For non-diabetes users, show welcome message with typing effect
        setIsTyping(true);
        const welcomeMsg = "Welcome! I'm your health assistant. I can help you with nutrition and wellness advice. How can I assist you today?";
        let index = 0;
        const tempId = "welcome-msg";
        
        setMessages([{
          id: tempId,
          role: "assistant" as const,
          content: "",
          created_at: new Date().toISOString(),
        }]);

        const timer = setInterval(() => {
          if (index < welcomeMsg.length) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId
                  ? { ...msg, content: welcomeMsg.slice(0, index + 1) }
                  : msg
              )
            );
            index++;
          } else {
            setIsTyping(false);
            clearInterval(timer);
          }
        }, 30);
      }
      
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
    if (!input.trim() || !userId) return;
    const content = input;
    setInput("");

    // Add optimistic user message
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

    // Show typing indicator for assistant
    setIsTyping(true);

    try {
      // Send message and get response
      const { assistantResponse } = await sendUserMessage(userId, content);
      
      // Add assistant response with typing effect
      const tempAssistantMsgId = `temp-assistant-${Date.now()}`;
      const assistantText = assistantResponse || "I've processed your request.";
      
      // Add empty assistant message
      setMessages(prev => [
        ...prev,
        {
          id: tempAssistantMsgId,
          role: "assistant" as const,
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      // Type out the assistant response
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < assistantText.length) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempAssistantMsgId
                ? { ...msg, content: assistantText.slice(0, index + 1) }
                : msg
            )
          );
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          
          // Refresh messages from DB to get proper IDs
          if (conversationId) {
            setTimeout(async () => {
              const updatedMessages = await getConversationMessages(conversationId);
              setMessages(updatedMessages);
            }, 100);
          }
        }
      }, 20);
    } catch (err) {
      console.error("Send error:", err);
      setIsTyping(false);
      
      // Remove temp messages and show error
      setMessages(prev => 
        prev.filter(m => !m.id.startsWith('temp-'))
      );
      
      // Show error message with typing effect
      const errorMsgId = `error-${Date.now()}`;
      const errorText = "Sorry, I encountered an error. Please try again.";
      
      setMessages(prev => [
        ...prev,
        {
          id: errorMsgId,
          role: "assistant" as const,
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      let index = 0;
      const errorInterval = setInterval(() => {
        if (index < errorText.length) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === errorMsgId
                ? { ...msg, content: errorText.slice(0, index + 1) }
                : msg
            )
          );
          index++;
        } else {
          clearInterval(errorInterval);
        }
      }, 20);
    }
  };

  const handleSendToChat = async (
    userMessage: string,
    aiResponse: string,
    convId: string
  ) => {
    setConversationId(convId);
    // Refresh messages to show the new conversation
    const updatedMessages = await getConversationMessages(convId);
    setMessages(updatedMessages);
    setShowAnalyzer(false);
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
            Manage Your Health Journey
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

        {/* Sticky Bottom Section with Input and Options */}
        <div
          className={`sticky bottom-0 bg-linear-to-t from-white via-white to-transparent pt-4 pb-6 transition-all duration-300 ${
            isScrolled ? "shadow-lg" : ""
          }`}
        >
          {/* Feature Action Buttons */}
          <div className="max-w-3xl mx-auto px-4">
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
              >
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Scan Food</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <Utensils className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Meal Planner</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-auto py-2 px-4 min-w-fit rounded-lg shadow-none hover:bg-accent hover:border-primary transition-all whitespace-nowrap bg-white border border-gray-200"
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>

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
                onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                placeholder="Ask about nutrition, meals, or diabetes management..."
                className="w-full rounded-lg shadow-none pl-16 pr-16 py-7 text-base focus-visible:ring-primary bg-white border border-gray-200 focus:border-primary"
                disabled={!userId || isTyping}
              />

              {/* Left icon inside input */}
              <Button
                onClick={handleImageUpload}
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 hover:bg-gray-100"
                disabled={!userId || isTyping}
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
              </Button>

              {/* Right icon inside input */}
              <Button
                onClick={handleSend}
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-lg h-9 w-9 bg-primary hover:bg-primary/90"
                disabled={!userId || !input.trim() || isTyping}
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

      {/* Analyzer Modal */}
      <AnalyzerModal
        isOpen={showAnalyzer}
        onClose={() => setShowAnalyzer(false)}
        onSendToChat={handleSendToChat}
        userId={userId}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && userId) {
            // Handle image upload
            // You can implement this based on your needs
            console.log("File selected:", file.name);
          }
        }}
      />
    </div>
  );
}