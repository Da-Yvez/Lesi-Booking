"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Chrome, Apple, ChevronLeft, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthFormProps {
  role: "customer" | "business";
  setRole: (role: "customer" | "business") => void;
  mode: "signin" | "signup";
  setMode: (mode: "signin" | "signup") => void;
}

export default function AuthForm({ role, setRole, mode, setMode }: AuthFormProps) {
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

        {/* Mode Toggles */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
             <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Account Type</Label>
                <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="w-full">
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

        <div className="space-y-3">
          <Button variant="outline" className="w-full bg-white text-black hover:bg-slate-200 border-none h-11 transition-all hover:scale-[1.02]">
            <Chrome className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
          <Button variant="outline" className="w-full bg-white text-black hover:bg-slate-200 border-none h-11 transition-all hover:scale-[1.02]">
            <Apple className="mr-2 h-4 w-4" /> Continue with Apple
          </Button>
          <Button variant="outline" className="w-full bg-white text-black hover:bg-slate-200 border-none h-11 transition-all hover:scale-[1.02]">
            <Github className="mr-2 h-4 w-4" /> Continue with GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-slate-500">Or</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-400">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                id="email" 
                placeholder="your.email@example.com" 
                className="pl-10 bg-white/5 border-white/10 text-white focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
          <Button className="w-full bg-white text-black hover:bg-slate-200 h-11 font-bold transition-all hover:scale-[1.02]">
            Continue With Email
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 leading-relaxed px-4">
          By clicking continue, you agree to our <Link href="/terms" className="underline hover:text-slate-300">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-300">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
