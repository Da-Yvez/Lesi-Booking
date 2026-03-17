"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import AuthVisual from "@/components/auth/AuthVisual";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const initialRole = searchParams.get("role") === "business" ? "business" : "customer";
  const nextPath = searchParams.get("next") || undefined;

  const [role, setRole] = useState<"customer" | "business" | null>(initialRole);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  return (
    <main className="flex min-h-screen w-full overflow-hidden">
      {/* Left Side: Visuals */}
      <AuthVisual role={role} mode={mode} />

      {/* Right Side: Form */}
      <AuthForm 
        role={role} 
        setRole={setRole} 
        mode={mode} 
        setMode={setMode}
        next={nextPath}
      />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}

