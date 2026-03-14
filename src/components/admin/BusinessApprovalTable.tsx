"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Building2, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Clock, MapPin, Mail, Phone, Globe, Briefcase, Tag
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
  ownerTitle: string;
  ownerPhone: string;
  ownerEmail: string;
  businessName: string;
  category: string;
  description: string;
  website: string;
  outlets: Outlet[];
}

interface Props {
  submissions: Submission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_business_approval: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  pending_listing_approval: { label: "Business Approved", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  listing_approved: { label: "Active", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function BusinessApprovalTable({ submissions, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending = submissions.filter(s => s.status === "pending_business_approval");

  if (pending.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-500/40 mx-auto" />
        <p className="text-slate-500">No businesses pending approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((sub) => {
        const st = statusConfig[sub.status] || statusConfig.pending_business_approval;
        const isOpen = expanded === sub.id;

        return (
          <motion.div
            key={sub.id}
            layout
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            {/* Row header */}
            <div className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{sub.businessName}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">{sub.ownerName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
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

            {/* Expanded details */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Owner */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Owner Details</h4>
                      {(
                        [
                          [Mail, sub.ownerEmail],
                          [Phone, sub.ownerPhone],
                          [Briefcase, sub.ownerTitle],
                        ] as [React.ElementType, string][]
                      ).map(([Icon, val], i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-400 text-xs">
                          <Icon className="w-3.5 h-3.5 text-slate-600" />
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                    {/* Business */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business</h4>
                      {sub.website && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Globe className="w-3.5 h-3.5 text-slate-600" />
                          <a href={sub.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{sub.website}</a>
                        </div>
                      )}
                      <p className="text-slate-400 text-xs leading-relaxed">{sub.description}</p>
                    </div>
                    {/* Outlets */}
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outlets ({sub.outlets.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sub.outlets.map((o, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <p className="text-white text-xs font-semibold">{o.name} <span className="text-blue-400 text-[10px]">— {o.type}</span></p>
                            <p className="text-slate-500 text-[11px] flex items-center gap-1"><MapPin className="w-3 h-3" />{o.address}, {o.city}</p>
                            <p className="text-slate-600 text-[11px] flex items-center gap-1"><Clock className="w-3 h-3" />{o.hours}</p>
                          </div>
                        ))}
                      </div>
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
