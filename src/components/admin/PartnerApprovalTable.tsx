"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle,
  User, Mail, CreditCard,
  Clock, FileText, Image as ImageIcon,
  Building2, Hash, ExternalLink, Loader2, Shield
} from "lucide-react";
import { getUrl } from "aws-amplify/storage";

interface PartnerSubmission {
  id: string;
  submittedAt: string;
  status: string;
  plan: string;
  planPrice: string;
  fullName: string;
  email: string;
  ownerEmail: string;
  businessRegistrationId?: string;
  businessBrandName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  proofFileKey?: string;
}

interface Props {
  submissions: PartnerSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PartnerApprovalTable({ submissions, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);

  const pending = submissions.filter(s => s.status === "pending_partner_approval");

  const handleViewProof = async (proofFileKey: string) => {
    try {
      setLoadingProof(true);
      const result = await getUrl({ path: proofFileKey });
      setPreviewImage(result.url.toString());
    } catch (err) {
      console.error("Failed to fetch proof image", err);
      alert("Failed to load payment proof image.");
    } finally {
      setLoadingProof(false);
    }
  };

  if (pending.length === 0) {
    return (
      <div className="bg-[#0d0d15] border border-white/5 rounded-3xl p-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-10 h-10 text-indigo-400/50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Pending Purchases</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
          Fresh partner plan submissions will appear here for verification and activation.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pending.map((sub) => {
          const isOpen = expanded === sub.id;

          return (
            <motion.div
              key={sub.id}
              layout
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen ? "bg-[#11111d] border-indigo-500/30 shadow-xl shadow-indigo-500/5" : "bg-[#0d0d15] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Row header */}
              <div className="flex items-center gap-4 p-5">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 border-white/10 text-slate-400"
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-white text-base truncate">{sub.fullName}</p>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-md text-indigo-400 font-black uppercase tracking-wider border border-indigo-500/20">
                      {sub.plan}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock size={14} className="text-slate-600" />
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <Hash size={14} />
                      {sub.planPrice}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 pr-2 border-r border-white/5">
                    <button
                      onClick={() => onApprove(sub.id)}
                      className="h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => onReject(sub.id)}
                      className="h-10 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                  <button
                    onClick={() => setExpanded(isOpen ? null : sub.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isOpen ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Account Details */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-indigo-400">
                             <User size={16} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Account Details</h4>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Owner Email</p>
                              <p className="text-sm font-semibold text-white break-all flex items-center gap-2">
                                <Mail size={14} className="text-slate-600" />
                                {sub.ownerEmail}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Business ID</p>
                              <p className="text-sm font-semibold text-slate-300 font-mono bg-black/20 px-2 py-1 rounded-md inline-block">
                                {sub.businessRegistrationId || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Plan & Billing */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-purple-400">
                             <FileText size={16} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Plan & Billing</h4>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-bold uppercase">Plan Type</span>
                              <span className="text-sm font-bold text-white capitalize">{sub.plan}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-bold uppercase">Amount Due</span>
                              <span className="text-sm font-bold text-emerald-400">{sub.planPrice}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-bold uppercase">Submission Date</span>
                              <span className="text-sm font-semibold text-slate-300">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Verification */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-400">
                             <Shield size={16} className="text-amber-500" />
                             <h4 className="text-xs font-black uppercase tracking-widest">Verification</h4>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase">Method</span>
                                <span className="text-xs font-bold text-white uppercase bg-white/10 px-2 py-0.5 rounded-md">{sub.paymentMethod || "Direct Transfer"}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase">Reference</span>
                                <span className="text-xs font-mono font-bold text-amber-500">{sub.referenceNumber || "NO_REF"}</span>
                             </div>
                             {sub.proofFileKey && (
                                <button 
                                  onClick={() => handleViewProof(sub.proofFileKey!)} 
                                  disabled={loadingProof}
                                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-[#09090f] text-xs font-black transition-all active:scale-95"
                                >
                                  {loadingProof ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                                  {loadingProof ? "Loading Proof..." : "Verify Slip / Receipt"}
                                </button>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* Helper Note */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                         <div className="flex items-center gap-3">
                            <Building2 size={18} className="text-indigo-400" />
                            <p className="text-xs font-medium text-slate-400 leading-tight">
                               Verify this payment against your bank statement before approving. <br/>
                               Once approved, the partner will be granted access to create listings.
                            </p>
                         </div>
                         <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                            Go to Business Profile <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
            />
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d15] shadow-2xl pointer-events-auto shadow-indigo-500/10"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Proof Verification</p>
                   <button
                     onClick={() => setPreviewImage(null)}
                     className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                   >
                     ✕
                   </button>
                </div>
                <div className="p-8 flex justify-center bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage}
                    alt="Payment proof"
                    className="max-h-[70vh] rounded-xl shadow-2xl ring-1 ring-white/10 object-contain"
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
