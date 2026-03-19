"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building2, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Clock, MapPin, Tag, DollarSign, Info, Users, 
  ShieldCheck, HelpCircle, Image as ImageIcon, ExternalLink,
  Calendar, CreditCard, Loader2
} from "lucide-react";
import { getUrl } from "aws-amplify/storage";

interface Listing {
  id: string;
  createdAt: string;
  status: string;
  title: string;
  businessName?: string;
  category: string;
  subcategory: string;
  description: string;
  instructions?: string;
  tags?: string[];
  price: number;
  currency: string;
  duration: number;
  bufferTime?: number;
  discount?: string;
  address: string;
  mapPin?: string;
  serviceType: string;
  coverImageKey: string;
  workingDays?: string; // JSON
  timeSlots?: string; // JSON
  maxCustomersPerBooking?: number;
  cancellationPolicy: string;
  reschedulePolicy?: string;
  noShowPolicy?: string;
  acceptOnlinePayment?: boolean;
  paymentMethods?: string[];
}

interface Props {
  listings: Listing[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function AdminListingImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUrl() {
      try {
        const result = await getUrl({ path });
        setUrl(result.url.toString());
      } catch (err) {
        console.error("Failed to fetch admin listing image", err);
      } finally {
        setLoading(false);
      }
    }
    if (path) fetchUrl();
  }, [path]);

  if (loading) return (
    <div className="w-full h-full flex items-center justify-center bg-white/5">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" />
    </div>
  );

  if (!url) return (
    <div className="w-full h-full flex items-center justify-center bg-white/5">
      <ImageIcon className="w-12 h-12 text-white/10" />
    </div>
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={url} 
      alt="Preview" 
      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
    />
  );
}

export default function ListingApprovalTable({ listings, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const pending = listings.filter(s => s.status === "pending_approval");

  const handleViewMedia = async (key: string) => {
    try {
      setLoadingMedia(true);
      const result = await getUrl({ path: key });
      setPreviewImage(result.url.toString());
    } catch (err) {
      console.error("Failed to fetch media", err);
      alert("Failed to load image preview.");
    } finally {
      setLoadingMedia(false);
    }
  };

  if (pending.length === 0) {
    return (
      <div className="bg-[#0d0d15] border border-white/5 rounded-3xl p-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-indigo-400/50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Pending Listings</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
           New service listings will appear here for quality review and publication.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((sub) => {
        const isOpen = expanded === sub.id;

        return (
          <motion.div
            key={sub.id}
            layout
            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
              isOpen ? "bg-[#11111d] border-indigo-500/30 shadow-2xl shadow-indigo-500/10" : "bg-[#0d0d15] border-white/5 hover:border-white/10"
            }`}
          >
            {/* Header Row */}
            <div className="flex items-center gap-4 p-6">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                isOpen ? "bg-indigo-600 text-white border-indigo-500 rotate-6" : "bg-white/5 border-white/10 text-indigo-400"
              }`}>
                <Building2 className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-white text-lg tracking-tight truncate">{sub.title}</p>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-400 font-black uppercase tracking-wider border border-amber-500/20">
                    Review Required
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold group">
                     <span className="text-slate-600">by</span>
                     <span className="text-slate-300 group-hover:text-indigo-400 transition-colors cursor-default">{sub.businessName || "Unknown Partner"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400/80 font-black uppercase tracking-widest">
                    <Tag size={12} />
                    {sub.category} <span className="text-white/20">/</span> {sub.subcategory}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                  <button
                    onClick={() => onApprove(sub.id)}
                    className="h-11 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-black flex items-center gap-2 transition-all active:scale-90"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => onReject(sub.id)}
                    className="h-11 px-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-black flex items-center gap-2 transition-all active:scale-90"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
                <button
                  onClick={() => setExpanded(isOpen ? null : sub.id)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isOpen ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Detailed View */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="px-8 pb-8 pt-2 border-t border-white/5 space-y-10">
                    
                    {/* Top Row: visual + Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                       <div className="lg:col-span-4 space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Service Preview</h4>
                          <div className="relative aspect-video rounded-3xl overflow-hidden group bg-white/5 border border-white/5">
                             <AdminListingImage path={sub.coverImageKey} />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <button 
                                  onClick={() => handleViewMedia(sub.coverImageKey)}
                                  disabled={loadingMedia}
                                  className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl"
                                >
                                  {loadingMedia ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                                </button>
                             </div>
                             <div className="absolute bottom-4 left-4 right-4 text-center">
                                <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest inline-block">
                                   Full Size View
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {sub.tags?.map(t => (
                               <span key={t} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/10">#{t}</span>
                             ))}
                          </div>
                       </div>

                       <div className="lg:col-span-8 space-y-6">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Service Description</h4>
                             <p className="text-slate-300 text-sm leading-relaxed font-medium bg-white/[0.02] p-6 rounded-3xl border border-white/5 italic">
                                "{sub.description}"
                             </p>
                          </div>
                          {sub.instructions && (
                             <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                   <Info size={14} /> Customer Instructions
                                </h4>
                                <p className="text-indigo-200/60 text-xs font-medium pl-2 border-l-2 border-indigo-500/20">
                                   {sub.instructions}
                                </p>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                       
                       {/* Section 1: Pricing */}
                       <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="flex h-8 w-8 rounded-xl bg-emerald-500/20 items-center justify-center text-emerald-400">
                             <DollarSign size={18} />
                          </div>
                          <div className="space-y-1">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pricing & Value</h5>
                             <div className="flex items-baseline gap-1 pt-1">
                                <span className="text-2xl font-black text-white">{sub.price}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{sub.currency}</span>
                             </div>
                             {sub.discount && <p className="text-[10px] text-emerald-400 font-black uppercase">🔥 {sub.discount} Discount</p>}
                          </div>
                       </div>

                       {/* Section 2: Time & Capacity */}
                       <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="flex h-8 w-8 rounded-xl bg-blue-500/20 items-center justify-center text-blue-400">
                             <Clock size={18} />
                          </div>
                          <div className="space-y-1">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Time & Capacity</h5>
                             <p className="text-base font-bold text-white pt-1">{sub.duration} Minutes <span className="text-xs text-slate-500">Duration</span></p>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-tight">
                                <Users size={12} /> Max {sub.maxCustomersPerBooking || 1} Guests
                                {sub.bufferTime && <span className="text-white/20 ml-1">+ {sub.bufferTime}m Buffer</span>}
                             </div>
                          </div>
                       </div>

                       {/* Section 3: Location */}
                       <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="flex h-8 w-8 rounded-xl bg-purple-500/20 items-center justify-center text-purple-400">
                             <MapPin size={18} />
                          </div>
                          <div className="space-y-1">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Location</h5>
                             <p className="text-xs font-bold text-white pt-1 leading-tight line-clamp-2">{sub.address}</p>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-400 uppercase tracking-tight">
                                <Info size={12} /> {sub.serviceType.replace('_', ' ')}
                             </div>
                          </div>
                       </div>

                       {/* Section 4: Payments */}
                       <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="flex h-8 w-8 rounded-xl bg-amber-500/20 items-center justify-center text-amber-500">
                             <CreditCard size={18} />
                          </div>
                          <div className="space-y-1">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Rules</h5>
                             <p className="text-base font-bold text-white pt-1">{sub.acceptOnlinePayment ? "Online Enabled" : "Pay at Venue"}</p>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-tight">
                                <ShieldCheck size={12} /> {sub.paymentMethods?.join(', ') || 'Cash Only'}
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Bottom Row: Availability & Policies */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 text-indigo-400">
                             <Calendar size={16} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Availability Overview</h4>
                          </div>
                          <div className="bg-black/20 rounded-3xl p-6 border border-white/5 h-full min-h-[140px]">
                             <div className="flex flex-wrap gap-2">
                                {sub.workingDays ? (() => {
                                   try {
                                      const parsed = JSON.parse(sub.workingDays);
                                      if (Array.isArray(parsed)) {
                                         return parsed.map((day: string) => (
                                            <span key={day} className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/20">
                                               {day}
                                            </span>
                                         ));
                                      }
                                      if (typeof parsed === 'object' && parsed !== null) {
                                         return Object.entries(parsed)
                                           .filter(([_, val]) => val)
                                           .map(([day]) => (
                                              <span key={day} className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/20">
                                                 {day}
                                              </span>
                                           ));
                                      }
                                      return <span className="text-slate-300 text-xs font-bold uppercase">{String(parsed)}</span>;
                                   } catch {
                                      return <span className="text-slate-300 text-xs font-bold uppercase">{sub.workingDays}</span>;
                                   }
                                })() : <span className="text-slate-500 text-xs italic">Flexible / Not set</span>}
                             </div>
                             <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Selected Slots</p>
                                <div className="font-mono text-[10px] text-indigo-200/40 bg-black/40 p-3 rounded-xl overflow-hidden truncate">
                                   {sub.timeSlots || "Automatic generated based on duration"}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center gap-2 text-rose-400">
                             <HelpCircle size={16} />
                             <h4 className="text-xs font-black uppercase tracking-widest">System Policies</h4>
                          </div>
                          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 divide-y divide-white/5 space-y-4">
                             {[
                                { l: "Cancellation", v: sub.cancellationPolicy },
                                { l: "Reschedule", v: sub.reschedulePolicy || "Standard" },
                                { l: "No-Show", v: sub.noShowPolicy || "Forfeit Deposit" }
                             ].map(item => (
                                <div key={item.l} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                                   <span className="text-[10px] font-black uppercase text-slate-500 min-w-[80px]">{item.l}</span>
                                   <span className="text-xs font-bold text-slate-300 text-right">{item.v}</span>
                                </div>
                             ))}
                          </div>
                       </div>

                    </div>

                    {/* Verification Action Bar */}
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
                       <p className="text-xs font-semibold text-indigo-300">
                          ID: <span className="font-mono opacity-60 ml-1">{sub.id}</span>
                       </p>
                       <button className="text-xs font-bold text-white hover:text-indigo-400 flex items-center gap-2 group transition-colors">
                          Check Partner History <ExternalLink size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                       </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Media Preview Overlay */}
      <AnimatePresence>
        {previewImage && (
          <>
            <motion.div 
              className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
            />
            <motion.div 
              className="fixed inset-0 z-[70] flex items-center justify-center p-8 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="max-w-4xl w-full bg-[#0d0d15] rounded-3xl overflow-hidden border border-white/10 shadow-2xl pointer-events-auto">
                 <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Listing Asset Verification</p>
                    <button onClick={() => setPreviewImage(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10">✕</button>
                 </div>
                 <div className="p-10 flex justify-center bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Listing Asset" className="max-h-[70vh] rounded-2xl shadow-2xl ring-1 ring-white/10" />
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
