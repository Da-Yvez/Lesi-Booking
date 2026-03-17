"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthVisualProps {
  role: "customer" | "business" | null;
  mode: "signin" | "signup";
}

const content = {
  default: {
    quote: "The most advanced booking platform for modern businesses and their customers.",
    author: "LesiBooking",
  },
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
  const currentKey = role ? `${role}_${mode}` : 'default';
  const current = (content as any)[currentKey];

  return (
    <div className="hidden lg:flex relative w-1/2 h-screen bg-slate-50 overflow-hidden flex-col justify-end p-12 border-r border-gray-200">
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

    </div>
  );
}

// Pre-compute stable random durations outside the component to avoid
// Math.random() being called during render (causes SSR/client hydration mismatch).
const FLOATING_PATH_DURATIONS = Array.from({ length: 36 }, () => 25 + Math.random() * 15);

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(59,130,246,${0.12 + i * 0.015})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-indigo-400"
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
            strokeOpacity={0.15 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.2 }}
            animate={{
              pathLength: 1,
              opacity: [0.1, 0.3, 0.1],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: FLOATING_PATH_DURATIONS[path.id],
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}


