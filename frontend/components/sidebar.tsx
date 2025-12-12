"use client";

import { useState } from "react";
import {
  Home,
  BookOpen,
  Apple,
  Book,
  Database,
  PanelsTopLeft,
  X,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(true);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "health-diary", label: "My Health Diary", icon: Book, href: "/health-diary" },
    { id: "meal-planner", label: "Meal Planner", icon: Apple, href: "/meal-planner" },
    { id: "nutrition-guide", label: "Nutrition Guide", icon: BookOpen, href: "/nutrition-guide" },
    { id: "food-database", label: "Food Database", icon: Database, href: "/food-database" },
  ];

  const chatHistory = [
    { id: 1, name: "Weight loss plan", unread: true },
    { id: 2, name: "Gut health questions" },
    { id: 3, name: "Allergy concerns" },
    { id: 4, name: "Meal prep ideas" },
    { id: 5, name: "Fitness routine" },
  ];

  const handleLogoAreaClick = () => {
    if (collapsed) {
      setCollapsed(false);
    }
  };

  const handleLogoAreaMouseEnter = () => {
    if (collapsed) {
      setIsHoveringLogo(true);
    }
  };

  const handleLogoAreaMouseLeave = () => {
    if (collapsed) {
      setIsHoveringLogo(false);
    }
  };

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col h-screen sticky top-0",
        collapsed ? "w-64 lg:w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4 shrink-0">
        {/* LOGO SECTION */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center transition-all duration-300 relative",
                collapsed
                  ? "gap-3 lg:flex-col lg:w-8 cursor-ew-resize"
                  : "gap-3"
              )}
              onMouseEnter={handleLogoAreaMouseEnter}
              onMouseLeave={handleLogoAreaMouseLeave}
              onClick={handleLogoAreaClick}
            >
              <div className="relative w-6 h-6 transition-opacity duration-300">
                {/* Logo */}
                <Link
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300 cursor-pointer",
                    collapsed && isHoveringLogo ? "lg:opacity-0" : "opacity-100"
                  )}
                  href="/"
                >
                  <h1 className="text-xl font-serif text-gray-900 text-center">
                    AI
                  </h1>
                </Link>

                {/* Icon when hovered */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    collapsed && isHoveringLogo
                      ? "opacity-0 lg:opacity-100"
                      : "opacity-0"
                  )}
                >
                  <PanelsTopLeft className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
          </TooltipTrigger>

          {/* Tooltip only when collapsed */}
          {collapsed && (
            <TooltipContent side="right" className="hidden lg:block">
              Open sidebar
            </TooltipContent>
          )}
        </Tooltip>

        <div className="flex items-center gap-1">
          {/* Mobile close - Only shows on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onNavigate}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Collapse toggle - Desktop only */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hidden lg:flex transition-opacity duration-300 cursor-ew-resize",
                  collapsed && "opacity-0 pointer-events-none"
                )}
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelsTopLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>

            {/* Tooltip only on desktop */}
            <TooltipContent side="right" className="hidden lg:block">
              Close sidebar
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-hidden hover:overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, href }) => {
          const isActive =
            (id === "dashboard" && pathname === "/") ||
            (id === "health-diary" && pathname.startsWith("/health-diary")) ||
            (id === "meal-planner" && pathname.startsWith("/meal-planner")) ||
            (id === "nutrition-guide" && pathname.startsWith("/nutrition-guide")) ||
            (id === "food-database" && pathname.startsWith("/food-database")) ||
            (id === "health-chat" && pathname.startsWith("/health-chat"));

          // Wrap the button with Tooltip when sidebar is collapsed
          const buttonContent = (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-colors cursor-pointer",
                collapsed ? "px-4 lg:justify-center lg:px-2" : "px-4",
                isActive && "bg-gray-200 text-gray-900",
                "hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5 text-gray-700" />
              <span
                className={cn(
                  "truncate",
                  collapsed && "lg:hidden"
                )}
              >
                {label}
              </span>
            </Button>
          );

          return (
            <Link key={id} href={href}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                  <TooltipContent side="right" className="lg:block hidden">
                    {label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                buttonContent
              )}
            </Link>
          );
        })}

        {/* Health Chat History Section */}
        {!collapsed && (
          <div className="pt-6 border-t border-gray-200 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Chat History
            </h3>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/health-chat/${chat.id}`}
                  className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-gray-100 text-sm transition-colors"
                >
                  <span className="truncate text-gray-700">
                    {chat.name}
                  </span>
                  {chat.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Premium Upsell Card */}
        <div className={cn(
          "mt-6 mx-2 rounded-lg p-4 bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200",
          collapsed && "lg:hidden"
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <h4 className="text-sm font-semibold text-gray-900">Health Analytics Pro</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Get advanced insights, trend analysis, and personalized recommendations
              </p>
              <Button
                size="sm"
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs h-8"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t border-gray-200 shrink-0",
          collapsed && "lg:hidden"
        )}
      >
        <p className="text-xs text-gray-500">v1.0.0</p>
      </div>
    </aside>
  );
}