"use client";

import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doSignOut = async () => {
      try {
        await signOut({ global: true });
      } catch {
        // Already signed out — that's fine
      } finally {
        router.replace("/login");
      }
    };
    doSignOut();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-slate-500 text-sm font-medium">Signing you out…</p>
    </div>
  );
}
