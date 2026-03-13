"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface AuthVisualProps {
  role: "customer" | "business";
  mode: "signin" | "signup";
}

const content = {
  customer_signin: {
    image: "/auth/CIN.png",
    quote: "This platform has helped me to save time and serve my clients faster than ever before.",
    author: "Ali Hassan",
  },
  customer_signup: {
    image: "/auth/CUP.png",
    quote: "Joining was the best decision for my personal projects. Everything is so streamlined.",
    author: "Sarah Jenkins",
  },
  business_signin: {
    image: "/auth/BIN.png",
    quote: "Managing 100+ employees and their schedules has never been this elegant.",
    author: "Michael Chen",
  },
  business_signup: {
    image: "/auth/BUP.png",
    quote: "Scale your business with the most advanced booking engine on the planet.",
    author: "Elena Rodriguez",
  },
};

export default function AuthVisual({ role, mode }: AuthVisualProps) {
  const currentKey = `${role}_${mode}` as keyof typeof content;
  const current = content[currentKey];

  return (
    <div className="hidden lg:flex relative w-1/2 h-screen bg-[#0a0a0a] overflow-hidden flex-col justify-end p-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={current.image}
            alt="Auth Visual"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKey + "_text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xl font-light text-white leading-relaxed">
              "{current.quote}"
            </p>
            <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-xs">
              ~ {current.author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

