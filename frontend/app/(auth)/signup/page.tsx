/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const supabase = getSupabaseBrowserClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    // Redirect to onboarding after a delay
    setTimeout(() => {
      router.push("/onboarding");
    }, 2000);
    router.refresh();
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
          Create Account
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Sign up for your nutrition analyzer account
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col">
        <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
          {/* FULL NAME */}
          <div className="relative mt-2 w-full">
            <input
              type="text"
              id="fullName"
              placeholder=" "
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm"
            />
            <label
              htmlFor="fullName"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
                peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Full Name
            </label>
          </div>

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

          {/* CONFIRM PASSWORD */}
          <div className="relative mt-2 w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm pr-10 sm:pr-12"
            />
            <label
              htmlFor="confirmPassword"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
                peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Confirm Password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-12 rounded-lg text-sm sm:text-md"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-3 sm:mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mt-3 sm:mt-4">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
