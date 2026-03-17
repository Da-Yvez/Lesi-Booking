"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import CheckoutForm from "@/components/partner/CheckoutForm";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAuthState().then((state) => {
      if (!state.authed || state.role !== "business") {
        router.replace("/login?mode=signin&role=business&next=/partner");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Minimal top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/partner" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">L</div>
            <span className="text-base font-bold tracking-tight text-slate-800">
              Lesi<span className="text-blue-600">Booking</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </header>

      <CheckoutForm />
    </main>
  );
}

export default function PartnerCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
