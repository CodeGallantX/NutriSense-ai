"use client";

import { useState } from "react";
import {
  Home,
  BookOpen,
  Apple,
  Heart,
  CreditCard,
  PanelsTopLeft,
  X,
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
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
    { id: "nutrition-guide", label: "Nutrition Guide", icon: BookOpen, href: "/nutrition-guide" },
    { id: "meal-planner", label: "Meal Planner", icon: Apple, href: "/meal-planner" },
    { id: "recipes", label: "Recipes", icon: Heart, href: "/recipes" },
    { id: "billing", label: "Billing", icon: CreditCard, href: "/billing" },
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
        // CHANGE 2: Logic for width.
        // On Mobile (default): Always w-64.
        // On Desktop (lg): Checks collapsed state.
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
            (id === "nutrition-guide" && pathname.startsWith("/nutrition-guide")) ||
            (id === "meal-planner" && pathname.startsWith("/meal-planner")) ||
            (id === "recipes" && pathname.startsWith("/recipes")) ||
            (id === "billing" && pathname === "/billing");

          // Wrap the button with Tooltip when sidebar is collapsed
          const buttonContent = (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-colors cursor-pointer",
                // CHANGE 3: Handle padding logic with lg: prefix
                collapsed ? "px-4 lg:justify-center lg:px-2" : "px-4",
                isActive && "bg-gray-200 text-gray-900",
                "hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5 text-gray-700" />
              {/* CHANGE 4: Use CSS to hide text instead of conditional rendering */}
              <span
                className={cn(
                  "truncate",
                  // Always show on mobile, hide on desktop if collapsed
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
      </nav>

      {/* Footer */}
      {/* CHANGE 6: Hide footer via CSS on desktop if collapsed */}
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