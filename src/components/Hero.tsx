"use client";

import { Warp } from "@paper-design/shaders-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Building2, ArrowRight } from "lucide-react";
import { getAuthState } from "@/lib/authGuard";
import AuthGateModal from "@/components/AuthGateModal";

export default function Hero() {
  const [modal, setModal] = useState<"book" | "list-business" | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<"book" | "list-business" | null>(null);
  const router = useRouter();

  const handleCTA = async (intent: "book" | "list-business") => {
    setCheckingAuth(intent);
    const requiredRole = intent === "book" ? "customer" : "business";
    const state = await getAuthState();

    if (!state.authed) {
      setCheckingAuth(null);
      setModal(intent);
      return;
    }

    if (state.role !== requiredRole) {
      setCheckingAuth(null);
      setModal(intent);
      return;
    }

    setCheckingAuth(null);
    router.push(`/${intent}`);
  };

  return (
    <>
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center bg-black">
        {/* Warp Shader Background */}
        <div className="absolute inset-0 z-0">
          <Warp
            style={{ height: "100%", width: "100%" }}
            proportion={0.45}
            softness={1}
            distortion={0.25}
            swirl={0.8}
            swirlIterations={10}
            shape="checks"
            shapeScale={0.1}
            scale={1}
            rotation={0}
            speed={0.5}
            colors={["hsl(220, 100%, 10%)", "hsl(210, 100%, 30%)", "hsl(250, 90%, 20%)", "hsl(200, 100%, 40%)"]}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            Smart Booking, Simplified
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] drop-shadow-2xl">
            Discover & Book{" "}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Services Near You.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            From salons to clinics — find, compare, and book appointments instantly.
            Businesses: list your services and reach thousands of customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Book Now */}
            <button
              onClick={() => handleCTA("book")}
              disabled={checkingAuth === "book"}
              className="group w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {checkingAuth === "book" ? "Checking…" : "Book Now"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Partner With Us */}
            <button
              onClick={() => handleCTA("list-business")}
              disabled={checkingAuth === "list-business"}
              className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all border border-white/20 shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
            >
              <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {checkingAuth === "list-business" ? "Checking…" : "Partner With Us"}
            </button>
          </div>

          <div className="pt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
            <span className="font-bold tracking-tighter text-xl">TRUSTED BY 100+ BUSINESSES</span>
          </div>
        </div>
      </section>

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        intent={modal ?? "book"}
      />
    </>
  );
}
