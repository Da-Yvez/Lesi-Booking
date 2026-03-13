"use client";

import { useState } from "react";
import { signIn, signUp, confirmSignUp, fetchUserAttributes, signOut, signInWithRedirect } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Chrome, ChevronLeft, KeyRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
  role: "customer" | "business" | null;
  setRole: (role: "customer" | "business" | null) => void;
  mode: "signin" | "signup";
  setMode: (mode: "signin" | "signup") => void;
}

export default function AuthForm({ role, setRole, mode, setMode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle the standard Cognito Sign Up flow:
  // 1. Submit Email + Password + Custom Attributes
  // 2. Receive Verification Code via Email
  // 3. Confirm Sign Up with the Code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { nextStep } = await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              "custom:role": role as string,
            },
          },
        });
        
        if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
          setShowVerification(true);
        }
      } else {
        const { isSignedIn } = await signIn({ username: email, password });
        if (isSignedIn) {
          // ROLE ISOLATION CHECK:
          // Even if the password is correct, we must ensure the user has the correct role
          const attributes = await fetchUserAttributes();
          const userRole = attributes['custom:role'];

          if (userRole !== role) {
            // Error: Wrong account type
            await signOut();
            setError(`This is a ${userRole} account. Please use the ${userRole === 'customer' ? 'Customer' : 'Business'} Sign In mode.`);
            return;
          }

          if (role === "business") router.push("/dashboard/business");
          else router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      if (isSignUpComplete) {
        // Automatically sign in after verification if possible, or just switch to sign in mode
        setMode("signin");
        setShowVerification(false);
        setError("Verification successful! You can now sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "Google" | "Apple") => {
    try {
      setLoading(true);
      await signInWithRedirect({ provider });
    } catch (err: any) {
      setError(err.message || "Social sign-in failed.");
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 py-12 bg-[#0a0a0a] min-h-screen relative overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
               <KeyRound className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Verify Email</h1>
            <p className="text-slate-400">
              We've sent a code to <span className="text-white font-medium">{email}</span>.
            </p>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${error.includes('successful') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-400 text-xs uppercase tracking-widest">Verification Code</Label>
              <Input 
                id="code" 
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-digit code" 
                className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-[0.5em] h-14 focus:ring-blue-600 transition-all font-mono"
                maxLength={6}
              />
            </div>
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify Account
            </Button>
            <button 
              type="button"
              onClick={() => setShowVerification(false)}
              className="w-full text-slate-500 text-sm hover:text-white transition-colors"
            >
              Back to Sign Up
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 py-12 bg-[#0a0a0a] min-h-screen relative overflow-y-auto">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Home
      </Link>

      <div className="w-full max-w-[400px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {mode === "signin" ? "Sign In" : "Join Now!"}
          </h1>
          <p className="text-slate-400">
            {mode === "signin" ? "Login to your account." : "Create your LesiBooking account."}
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm ${error.includes('successful') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {error}
          </div>
        )}

        {/* Mode Toggles */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
             <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Account Type</Label>
                <Tabs value={role || ""} onValueChange={(v) => setRole(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 h-10">
                    <TabsTrigger value="customer" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Customer</TabsTrigger>
                    <TabsTrigger value="business" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Business</TabsTrigger>
                  </TabsList>
                </Tabs>
             </div>

             <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Action</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 h-10">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Sign Up</TabsTrigger>
                  </TabsList>
                </Tabs>
             </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-400">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                id="email" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com" 
                className="pl-10 bg-white/5 border-white/10 text-white focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-400">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                id="password" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="pl-10 bg-white/5 border-white/10 text-white focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
          <Button 
            type="submit"
            disabled={loading || !role}
            className="w-full bg-white text-black hover:bg-slate-200 h-11 font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            type="button"
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-11 transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => handleSocialSignIn("Google")}
            disabled={loading || !role}
          >
            <Chrome className="mr-2 h-4 w-4" /> Google
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 leading-relaxed px-4">
          By clicking continue, you agree to our <Link href="/terms" className="underline hover:text-slate-300">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-300">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
