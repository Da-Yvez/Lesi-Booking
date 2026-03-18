"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle,
  User, Mail, Phone, Building2, Hash,
  MapPin, Clock, FileText, Image as ImageIcon,
  Globe, Star, Store
} from "lucide-react";
import { getUrl } from "aws-amplify/storage";

interface BusinessRegistration {
  id: string;
  ownerEmail: string;
  submittedAt: string;
  status: string;
  // Owner
  fullName?: string | null;
  nicNumber?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  ownerRole?: string | null;
  // Business
  businessLegalName?: string | null;
  businessBrandName?: string | null;
  registrationNumber?: string | null;
  legalStructure?: string | null;
  taxId?: string | null;
  countryOfRegistration?: string | null;
  yearsInOperation?: string | null;
  // Contact
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  hasPhysicalLocation?: boolean | null;
  numberOfBranches?: string | null;
  // Profile
  category?: string | null;
  shortDescription?: string | null;
  targetCustomers?: string | null;
  // Docs
  registrationFileKey?: string | null;
  ownerNicFileKey?: string | null;
  taxFileKey?: string | null;
}

interface Props {
  registrations: BusinessRegistration[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function BusinessRegistrationTable({ registrations, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const pending = registrations.filter(r => r.status === "pending_business_approval");

  const handleViewDoc = async (key: string) => {
    try {
      setLoadingDoc(true);
      const result = await getUrl({ path: key });
      setPreviewImage(result.url.toString());
    } catch (err) {
      console.error("Failed to fetch document", err);
      alert("Failed to load document.");
    } finally {
      setLoadingDoc(false);
    }
  };

  if (pending.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Store className="w-12 h-12 text-blue-500/30 mx-auto" />
        <p className="text-slate-500 text-sm">No business registrations pending approval.</p>
        <p className="text-slate-700 text-xs">Business submissions appear here after partners fill out the Business Info form.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pending.map((reg) => {
          const isOpen = expanded === reg.id;
          const displayName = reg.businessBrandName || reg.businessLegalName || "Unnamed Business";

          return (
            <motion.div
              key={reg.id}
              layout
              className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-blue-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{displayName}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{reg.fullName || reg.ownerEmail}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
                      {reg.category || "Uncategorised"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-yellow-400 bg-yellow-500/10 border-yellow-500/20">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600 hidden md:block">
                    {new Date(reg.submittedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onApprove(reg.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => onReject(reg.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => setExpanded(isOpen ? null : reg.id)}
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
                          [User, "Name", reg.fullName],
                          [Hash, "NIC", reg.nicNumber],
                          [Clock, "DOB", reg.dateOfBirth],
                          [Globe, "Nationality", reg.nationality],
                          [User, "Role", reg.ownerRole],
                        ] as [React.ElementType, string, string | null | undefined][]).map(([Icon, label, val], i) => (
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
                          [Building2, "Legal Name", reg.businessLegalName],
                          [FileText, "Reg No.", reg.registrationNumber],
                          [Building2, "Structure", reg.legalStructure],
                          [Hash, "Tax ID", reg.taxId],
                          [Globe, "Country", reg.countryOfRegistration],
                        ] as [React.ElementType, string, string | null | undefined][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500 min-w-[60px]">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</h4>
                        {([
                          [Mail, "Email", reg.email],
                          [Phone, "Phone", reg.phone],
                          [MapPin, "City", reg.city],
                          [MapPin, "Province", reg.province],
                          [Building2, "Physical Loc", reg.hasPhysicalLocation ? "Yes" : "No"],
                        ] as [React.ElementType, string, string | null | undefined][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500 min-w-[60px]">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Profile */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile</h4>
                        {([
                          [Star, "Category", reg.category],
                          [User, "Target", reg.targetCustomers],
                        ] as [React.ElementType, string, string | null | undefined][]).map(([Icon, label, val], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300 truncate">{val || "—"}</span>
                          </div>
                        ))}
                        <div className="pt-1">
                          <span className="text-slate-500 text-[10px] uppercase">Description</span>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{reg.shortDescription || "—"}</p>
                        </div>
                      </div>

                      {/* Documents row */}
                      <div className="md:col-span-4 mt-2 pt-3 border-t border-white/5 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { key: reg.registrationFileKey, label: "Business Registration", color: "emerald" },
                            { key: reg.ownerNicFileKey, label: "Owner NIC / ID", color: "blue" },
                            { key: reg.taxFileKey, label: "Tax Document (TIN)", color: "amber" },
                          ].map(({ key, label, color }) => (
                            <div key={label} className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className={`w-4 h-4 text-${color}-400`} />
                                <span className="text-xs font-bold text-slate-200">{label}</span>
                              </div>
                              {key ? (
                                <button
                                  onClick={() => handleViewDoc(key)}
                                  disabled={loadingDoc}
                                  className={`w-full justify-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 hover:bg-${color}-500/20 text-xs font-bold transition-all`}
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> {loadingDoc ? "Loading..." : "View Document"}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500 italic block text-center">Not provided</span>
                              )}
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

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
            />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl"
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              >
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-sm"
                >✕</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage} alt="Document" className="w-full max-h-[70vh] object-contain" />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
