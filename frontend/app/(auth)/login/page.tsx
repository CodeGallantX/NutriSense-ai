/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-1 p-4 sm:p-6 bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className="flex flex-col justify-center items-center mb-3 text-center max-w-sm w-full">
        <div className="mb-4">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">
            NutriSense AI
          </h1>
        </div>
        <h2 className="text-xl sm:text-2xl text-gray-900 font-medium mb-1">
          Welcome Back
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Sign in to your nutrition analyzer account
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col">
        <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
          {/* EMAIL */}
          <div className="relative mt-2 w-full">
            <input
              type="email"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm"
            />
            <label
              htmlFor="email"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
                peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Email Address
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative mt-2 w-full">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm pr-10 sm:pr-12"
            />
            <label
              htmlFor="password"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
                peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-12 rounded-lg text-sm sm:text-md"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-3 sm:mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mt-3 sm:mt-4">
          <p className="text-gray-600 text-sm">
            Don&rsquo;t have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}