// frontend/app/auth/login/page.tsx
// Login page for Supabase authentication, rebuilt to match reference image exactly

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer container: centers card, sets background
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Responsive Card: smaller on mobile, larger on desktop, less vertical padding */}
      <Card className="w-full max-w-sm md:max-w-4xl h-auto md:h-[500px] my-2 flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Logo section: much larger for desktop, balanced layout */}
        <div className="flex items-center justify-center bg-white md:h-full w-full md:w-1/2 md:order-none order-first">
          {/* Logo container: very large for desktop, object-contain, balanced */}
          <div className="w-full flex justify-center items-center pt-2 pb-1 md:pt-0 md:pb-0">
            <div className="w-full max-w-[340px] h-[160px] md:max-w-[800px] md:h-[400px] bg-white rounded flex items-center justify-center overflow-hidden">
              <Image
                src="/assetms-logo.png"
                alt="AssetMS Logo"
                fill={false}
                width={400}
                height={200}
                // Much larger image size for desktop
                className="object-contain object-center w-full h-full md:w-[800px] md:h-[400px]"
                priority
              />
            </div>
          </div>
        </div>
        {/* Login form section: increase max width for balance on desktop */}
        <div className="flex-1 flex items-start justify-center bg-white md:h-full h-auto">
          <div className="w-full max-w-xs md:max-w-lg pt-2 md:pt-8 pb-6 md:pb-8 px-4 md:px-8">
            <CardHeader className="pb-2 md:pb-4 mt-0">
              <CardTitle className="text-center text-xl md:text-2xl font-bold">
                Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Error alert if login fails */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* Email field */}
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                {/* Password field */}
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Forgot password link */}
                <div className="flex items-center justify-between">
                  <div className="text-xs md:text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                {/* Login button: always visible, full width */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                {/* Demo credentials (for testing): moved up for better balance */}
                <div className="text-center mt-2 md:mt-4">
                  <p className="text-xs md:text-sm text-gray-600">
                    Login: demo@example.com
                    <br />
                    Password: password01
                  </p>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
