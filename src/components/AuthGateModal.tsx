"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Building2 } from "lucide-react";
import Link from "next/link";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: "book" | "list-business";
}

const config = {
  "book": {
    icon: Calendar,
    title: "Book Your Appointment",
    description: "You need a Customer account to discover and book services.",
    role: "customer",
    next: "/book",
    accentColor: "blue",
  },
  "list-business": {
    icon: Building2,
    title: "List Your Business",
    description: "You need a Business account to partner with LesiBooking and list your services.",
    role: "business",
    next: "/list-business",
    accentColor: "purple",
  },
};

export default function AuthGateModal({ isOpen, onClose, intent }: AuthGateModalProps) {
  const cfg = config[intent];
  const Icon = cfg.icon;
  const isBlue = cfg.accentColor === "blue";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d16] shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow orb */}
              <div
                className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 ${
                  isBlue ? "bg-blue-500" : "bg-purple-500"
                }`}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative p-8 space-y-6">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isBlue ? "bg-blue-600/20 border border-blue-500/30" : "bg-purple-600/20 border border-purple-500/30"
                  }`}
                >
                  <Icon className={`w-7 h-7 ${isBlue ? "text-blue-400" : "text-purple-400"}`} />
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{cfg.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{cfg.description}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href={`/login?mode=signin&role=${cfg.role}&next=${cfg.next}`}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all hover:scale-[1.02] active:scale-95 ${
                      isBlue
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/login?mode=signup&role=${cfg.role}&next=${cfg.next}`}
                    className="w-full py-3 rounded-xl font-bold text-sm text-center bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Create Account
                  </Link>
                </div>

                <p className="text-center text-xs text-slate-600">
                  {intent === "book" ? "Already a business owner?" : "Just want to book?"}{" "}
                  <Link
                    href={`/login?mode=signin&role=${intent === "book" ? "business" : "customer"}`}
                    className="text-slate-400 hover:text-white underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
