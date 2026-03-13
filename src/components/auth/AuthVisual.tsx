"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthVisualProps {
  role: "customer" | "business";
  mode: "signin" | "signup";
}

const content = {
  customer_signin: {
    quote: "This platform has helped me to save time and serve my clients faster than ever before.",
    author: "Ali Hassan",
  },
  customer_signup: {
    quote: "Joining was the best decision for my personal projects. Everything is so streamlined.",
    author: "Sarah Jenkins",
  },
  business_signin: {
    quote: "Managing 100+ employees and their schedules has never been this elegant.",
    author: "Michael Chen",
  },
  business_signup: {
    quote: "Scale your business with the most advanced booking engine on the planet.",
    author: "Elena Rodriguez",
  },
};

export default function AuthVisual({ role, mode }: AuthVisualProps) {
  const currentKey = `${role}_${mode}` as keyof typeof content;
  const current = content[currentKey];

  return (
    <div className="hidden lg:flex relative w-1/2 h-screen bg-[#0a0a0a] overflow-hidden flex-col justify-end p-12 border-r border-white/5">
      {/* Background Animation (FloatingPaths) */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Radial Gradients for Depth */}
      <div
        aria-hidden
        className="absolute inset-0 isolate contain-strict opacity-30"
      >
        <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(59,130,246,0.1)_0,rgba(37,99,235,0.02)_50%,transparent_80%)] absolute top-0 right-0 h-[800px] w-[400px] -translate-y-1/2 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.05)_0,rgba(37,99,235,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[800px] w-[200px] translate-x-1/4 -translate-y-1/2 rounded-full" />
      </div>

      <div className="relative z-10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 max-w-lg shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKey + "_text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xl font-light text-white leading-relaxed italic">
              "{current.quote}"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-blue-500/50" />
              <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">
                {current.author}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(255,255,255,${0.05 + i * 0.01})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.2 }}
            animate={{
              pathLength: 1,
              opacity: [0.1, 0.3, 0.1],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}


