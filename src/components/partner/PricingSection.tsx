"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import AuthGateModal from "../AuthGateModal";

export default function PricingSection() {
  const [showGate, setShowGate] = useState(false);
  const [isBusinessUser, setIsBusinessUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAuthState().then((state) => {
      if (state.authed && state.role === "business") {
        setIsBusinessUser(true);
      }
    });
  }, []);

  const handleBuyNow = (plan: "monthly" | "annual") => {
    if (isBusinessUser) {
      router.push(`/partner/checkout?plan=${plan}`);
    } else {
      setShowGate(true);
    }
  };

  const features = [
    "Unlimited listings & outlets",
    "Priority placement in search",
    "Advanced analytics dashboard",
    "Automated email & SMS reminders",
    "Dedicated partner support",
  ];

  return (
    <section className="py-24 px-6 relative" id="pricing">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to manage your business operations smoothly, backed by our 1-month zero-risk free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-8"
          >
            <div>
              <h3 className="text-xl font-bold text-white">Monthly Flex</h3>
              <p className="text-slate-400 text-sm mt-2">Perfect for trying us out.</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$49</span>
                <span className="text-slate-500">/month</span>
              </div>
            </div>

            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-blue-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleBuyNow("monthly")}
              className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold transition-all"
            >
              Start 1 Month Free
            </button>
          </motion.div>

          {/* Yearly Plan (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border-2 border-blue-500 bg-blue-500/5 p-8 space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
              Most Popular
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Annual Pro</h3>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-slate-400 text-sm mt-2">Save 20% compared to monthly.</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$39</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Billed annually at $468</p>
            </div>

            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-blue-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleBuyNow("annual")}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/25"
            >
              Start 1 Month Free
            </button>
          </motion.div>
        </div>
      </div>

      {showGate && (
        <AuthGateModal 
          intent="list-business"
          isOpen={true}
          onClose={() => setShowGate(false)} 
        />
      )}
    </section>
  );
}
