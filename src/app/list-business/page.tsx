"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import ListingForm from "@/components/business/ListingForm";
import Navbar from "@/components/Navbar";
import { Loader2, Building2 } from "lucide-react";
import { Warp } from "@paper-design/shaders-react";

export default function ListBusinessPage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAuthState().then((state) => {
      if (!state.authed || state.role !== "business") {
        router.replace("/login?mode=signin&role=business&next=/list-business");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-black pt-24 pb-20">
        {/* Subtle background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <Warp
            style={{ height: "100%", width: "100%" }}
            proportion={0.3}
            softness={1}
            distortion={0.15}
            swirl={0.4}
            swirlIterations={6}
            shape="checks"
            shapeScale={0.08}
            scale={1}
            rotation={0}
            speed={0.2}
            colors={["hsl(260, 80%, 8%)", "hsl(280, 70%, 15%)", "hsl(240, 80%, 12%)", "hsl(220, 70%, 18%)"]}
          />
        </div>

        <div className="relative z-10">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto px-6 mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Partner Program
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              List Your Business
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Join hundreds of businesses connecting with customers through LesiBooking.
            </p>
          </div>

          <ListingForm />
        </div>
      </main>
    </>
  );
}
