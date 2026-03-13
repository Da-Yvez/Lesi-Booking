"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import AuthVisual from "@/components/auth/AuthVisual";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const initialRole = searchParams.get("role") === "business" ? "business" : "customer";

  const [role, setRole] = useState<"customer" | "business">(initialRole);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Sync state with URL only on first load
  useEffect(() => {
    if (searchParams.get("mode") === "signup") setMode("signup");
    if (searchParams.get("role") === "business") setRole("business");
  }, [searchParams]);

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

