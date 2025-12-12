// Updated Navbar component
// - User is now passed as a required prop from server-side fetch (remove optional ? if desired)
// - Updated logout to use Supabase client-side auth.signOut() for consistency
// - Assumes you have a Supabase client hook or instance available client-side
// - If not, install @supabase/supabase-js and create a client-side client (e.g., via createClient in a lib file)

"use client";

import { Menu, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client"; // Adjust to your client-side Supabase setup

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
  user: {
    // Made non-optional since fetched server-side
    name: string;
    email: string;
    avatar: string;
  };
  loading?: boolean;
}

const Navbar = ({ onMenuToggle, user }: NavbarProps) => {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient(); // Client-side Supabase instance
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const fallbackLetter = user.name.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin"); // Updated to match redirect path
  };

  return (
    <header className="h-16 border-b bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-serif text-gray-900 text-center">
          NutriSense AI
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="cursor-pointer"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{fallbackLetter}</AvatarFallback>
          </Avatar>
        </button>

        {isPopoverOpen && (
          <div
            onMouseEnter={() => setIsPopoverOpen(true)}
            onMouseLeave={() => setIsPopoverOpen(false)}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Header with Avatar, Name, Email */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{fallbackLetter}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-muted transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
