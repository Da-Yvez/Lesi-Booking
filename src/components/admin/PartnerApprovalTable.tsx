"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle,
  User, Mail, Phone, Building2, Hash, CreditCard,
  MapPin, Clock, FileText, Image as ImageIcon,
  Globe, Star
} from "lucide-react";
import { getUrl } from "aws-amplify/storage";

interface PartnerSubmission {
  id: string;
  submittedAt: string;
  status: string;
  plan: string;
  planPrice: string;
  // A. Owner
  fullName: string;
  nicNumber: string;
  dateOfBirth: string;
  nationality: string;
  ownerRole: string;
  
  // B. Legal
  businessLegalName: string;
  businessBrandName: string;
  registrationNumber: string;
  legalStructure: string;
  taxId: string;
  countryOfRegistration: string;
  yearsInOperation: string;
  
  // C&D. Presence
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  province: string;
  country: string;
  hasPhysicalLocation: boolean;
  numberOfBranches: string;
  
  // E. Profile
  category: string;
  shortDescription: string;
  targetCustomers: string;
  
  // Docs & Payment
  paymentMethod: string;
  referenceNumber: string;
  proofFileKey?: string;
  registrationFileKey?: string;
  ownerNicFileKey?: string;
  taxFileKey?: string;
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
                    <span className="text-xs text-slate-500">{sub.businessBrandName}</span>
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
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-5">
                      {/* Owner Identity */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Owner (KYC)</h4>
                        {([
                          [User, "Name", sub.fullName],
                          [Hash, "NIC", sub.nicNumber],
                          [Clock, "DOB", sub.dateOfBirth],
                          [Globe, "Nationality", sub.nationality],
                          [User, "Role", sub.ownerRole],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Business Legal */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legal Identity</h4>
                        {([
                          [Building2, "Legal Name", sub.businessLegalName],
                          [FileText, "Reg No.", sub.registrationNumber],
                          [Building2, "Structure", sub.legalStructure],
                          [Hash, "Tax ID", sub.taxId],
                          [Globe, "Country", sub.countryOfRegistration],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                             <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500 truncate min-w-[60px]">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Contact & Location */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact details</h4>
                        {([
                          [Mail, "Email", sub.email],
                          [Phone, "Phone", sub.phone],
                          [MapPin, "City", sub.city],
                          [MapPin, "Province", sub.province],
                          [Building2, "Physical Loc", sub.hasPhysicalLocation ? "Yes" : "No"],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500 truncate min-w-[60px]">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Profile */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Info</h4>
                        {([
                          [Star, "Category", sub.category],
                          [User, "Target", sub.targetCustomers],
                        ] as [React.ElementType, string, string][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                        <div className="pt-1">
                          <span className="text-slate-500 text-[10px] uppercase">Description</span>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{sub.shortDescription || "—"}</p>
                        </div>
                      </div>

                      {/* Documents & Payment row */}
                      <div className="md:col-span-4 mt-2 pt-3 border-t border-white/5 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment & Compliance Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          
                          {/* Payment Meta */}
                          <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-slate-400">Method:</span>
                              <span className="text-slate-300">Bank Transfer</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Hash className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-slate-400">Ref:</span>
                              <span className="text-purple-400 font-mono font-semibold">{sub.referenceNumber}</span>
                            </div>
                            {sub.proofFileKey && (
                               <button onClick={() => handleViewProof(sub.proofFileKey!)} disabled={loadingProof} className="w-full justify-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-all mt-2">
                                 <ImageIcon className="w-3.5 h-3.5" /> {loadingProof ? "Loading..." : "View Receipt"}
                               </button>
                            )}
                          </div>

                          {/* Business Reg Doc */}
                          <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-slate-200">Business Registration</span>
                            </div>
                            {sub.registrationFileKey ? (
                               <button onClick={() => handleViewProof(sub.registrationFileKey!)} disabled={loadingProof} className="w-full justify-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all">
                                 <ImageIcon className="w-3.5 h-3.5" /> View Document
                               </button>
                            ) : (
                              <span className="text-xs text-slate-500 italic block text-center">Not provided</span>
                            )}
                          </div>

                          {/* Owner NIC Doc */}
                          <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-slate-200">Owner Identity (NIC)</span>
                            </div>
                            {sub.ownerNicFileKey ? (
                               <button onClick={() => handleViewProof(sub.ownerNicFileKey!)} disabled={loadingProof} className="w-full justify-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all">
                                 <ImageIcon className="w-3.5 h-3.5" /> View ID Front/Back
                               </button>
                            ) : (
                              <span className="text-xs text-slate-500 italic block text-center">Not provided</span>
                            )}
                          </div>

                          {/* Tax Doc */}
                          <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-slate-200">Tax Document (TIN)</span>
                            </div>
                            {sub.taxFileKey ? (
                               <button onClick={() => handleViewProof(sub.taxFileKey!)} disabled={loadingProof} className="w-full justify-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all">
                                 <ImageIcon className="w-3.5 h-3.5" /> View Certificate
                               </button>
                            ) : (
                              <span className="text-xs text-slate-500 italic block text-center">Not provided</span>
                            )}
                          </div>

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
