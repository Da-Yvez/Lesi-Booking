"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Building2, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Clock, MapPin, Tag
} from "lucide-react";

interface Outlet {
  name: string;
  address: string;
  city: string;
  type: string;
  hours: string;
}

interface Submission {
  id: string;
  submittedAt: string;
  status: string;
  ownerName: string;
  businessName: string;
  category: string;
  description: string;
  outlets: Outlet[];
}

interface Props {
  submissions: Submission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ListingApprovalTable({ submissions, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending = submissions.filter(s => s.status === "pending_listing_approval");

  if (pending.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-blue-500/30 mx-auto" />
        <p className="text-slate-500 text-sm">No listings awaiting approval.</p>
        <p className="text-slate-700 text-xs">Listings appear here after their business is approved first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((sub) => {
        const isOpen = expanded === sub.id;

        return (
          <motion.div
            key={sub.id}
            layout
            className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden"
          >
            {/* Row */}
            <div className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{sub.businessName}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">{sub.outlets.length} outlet{sub.outlets.length !== 1 ? "s" : ""}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
                    Listing Pending
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1"><Tag className="w-3 h-3" />{sub.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-600 hidden md:block">
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onApprove(sub.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => onReject(sub.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => setExpanded(isOpen ? null : sub.id)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded Outlets */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 space-y-3">
                    <p className="text-slate-500 text-xs leading-relaxed">{sub.description}</p>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outlet Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.outlets.map((o, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <p className="text-white text-xs font-semibold">{o.name} <span className="text-purple-400 text-[10px]">— {o.type}</span></p>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1"><MapPin className="w-3 h-3" />{o.address}, {o.city}</p>
                          <p className="text-slate-600 text-[11px] flex items-center gap-1"><Clock className="w-3 h-3" />{o.hours}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
