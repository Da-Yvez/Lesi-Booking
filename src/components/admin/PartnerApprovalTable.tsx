"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle,
  User, Mail, Phone, Building2, Hash, CreditCard,
  MapPin, Clock, FileText, Image as ImageIcon
} from "lucide-react";
import { getUrl } from "aws-amplify/storage";

interface PartnerSubmission {
  id: string;
  submittedAt: string;
  status: string;
  plan: string;
  planPrice: string;
  fullName: string;
  nicNumber: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
  phone: string;
  whatsapp: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  businessName: string;
  registrationNumber: string;
  businessType: string;
  taxId: string;
  yearsInOperation: string;
  numberOfEmployees: string;
  paymentMethod: string;
  referenceNumber: string;
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
      <div className="text-center py-20 space-y-3">
        <CreditCard className="w-12 h-12 text-purple-500/30 mx-auto" />
        <p className="text-slate-500 text-sm">No partner purchases pending approval.</p>
        <p className="text-slate-700 text-xs">Submissions appear here after users complete the checkout flow.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pending.map((sub) => {
          const isOpen = expanded === sub.id;

          return (
            <motion.div
              key={sub.id}
              layout
              className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.03] overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{sub.fullName}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{sub.businessName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-purple-400 bg-purple-500/10 border-purple-500/20">
                      {sub.planPrice}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-yellow-400 bg-yellow-500/10 border-yellow-500/20">
                      Pending
                    </span>
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
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Personal */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personal</h4>
                        {([
                          [User, "Name", sub.fullName],
                          [Hash, "NIC", sub.nicNumber],
                          [Clock, "DOB", sub.dateOfBirth],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</h4>
                        {([
                          [Mail, "Email", sub.email],
                          [Phone, "Phone", sub.phone],
                          [Phone, "WhatsApp", sub.whatsapp],
                          [MapPin, "Address", `${sub.streetAddress}, ${sub.city}`],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                        {/* Business */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business</h4>
                        {([
                          [Building2, "Name", sub.businessName],
                          [FileText, "Reg No.", sub.registrationNumber],
                          [Hash, "Type", sub.businessType],
                          [Hash, "Tax ID", sub.taxId],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                             <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment row */}
                      <div className="md:col-span-3 mt-2 pt-3 border-t border-white/5 space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                              <span className="text-slate-500">Method:</span>
                              <span className="text-slate-300">Bank Transfer</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Hash className="w-3.5 h-3.5 text-slate-600" />
                              <span className="text-slate-500">Reference:</span>
                              <span className="text-purple-400 font-mono font-semibold">{sub.referenceNumber}</span>
                            </div>
                          </div>
                          {sub.proofFileKey && (
                            <div>
                              <button
                                onClick={() => handleViewProof(sub.proofFileKey!)}
                                disabled={loadingProof}
                                className="flex w-fit items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {loadingProof ? "Loading..." : <><ImageIcon className="w-3.5 h-3.5" /> View Payment Proof</>}
                              </button>
                            </div>
                          )}
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

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Payment proof"
                  className="w-full max-h-[70vh] object-contain"
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
