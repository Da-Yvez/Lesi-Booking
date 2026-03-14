"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import CategoryGrid from "@/components/booking/CategoryGrid";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export default function BookPage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAuthState().then((state) => {
      if (!state.authed || state.role !== "customer") {
        router.replace("/login?mode=signin&role=customer&next=/book");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <CategoryGrid />
      </main>
    </>
  );
}
