"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User, Building2, MapPin, CheckCircle2, Plus, Trash2,
  ChevronRight, ChevronLeft, Loader2, Clock, Globe, Phone, Mail, Briefcase
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Outlet {
  name: string;
  address: string;
  city: string;
  type: "main" | "franchise" | "popup" | "kiosk";
  hours: string;
}

interface FormData {
  // Step 1 - About you
  ownerName: string;
  ownerTitle: string;
  ownerPhone: string;
  ownerEmail: string;
  // Step 2 - Business info
  businessName: string;
  category: string;
  description: string;
  website: string;
  // Step 3 - Outlets
  outlets: Outlet[];
}

const BUSINESS_CATEGORIES = [
  "Salon & Hair", "Medical Clinic", "Dental Care", "Spa & Wellness",
  "Gym & Fitness", "Barbershop", "Makeup & Beauty", "Physiotherapy",
  "Veterinary", "Photography", "Tutoring", "Legal Services", "Other",
];

const OUTLET_TYPES = [
  { value: "main", label: "Main Branch" },
  { value: "franchise", label: "Franchise" },
  { value: "popup", label: "Pop-Up" },
  { value: "kiosk", label: "Kiosk" },
];

const STEPS = [
  { id: 1, label: "About You", icon: User },
  { id: 2, label: "Business", icon: Building2 },
  { id: 3, label: "Outlets", icon: MapPin },
  { id: 4, label: "Review", icon: CheckCircle2 },
];

const defaultOutlet: Outlet = { name: "", address: "", city: "", type: "main", hours: "Mon–Fri 9am–6pm" };

// ─── Input Component ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", icon: Icon }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; icon?: React.ElementType;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm`}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    ownerName: "", ownerTitle: "", ownerPhone: "", ownerEmail: "",
    businessName: "", category: "", description: "", website: "",
    outlets: [{ ...defaultOutlet }],
  });

  const update = (key: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateOutlet = (idx: number, key: keyof Outlet, value: string) =>
    setForm(prev => {
      const outlets = [...prev.outlets];
      outlets[idx] = { ...outlets[idx], [key]: value };
      return { ...prev, outlets };
    });

  const addOutlet = () =>
    setForm(prev => ({ ...prev, outlets: [...prev.outlets, { ...defaultOutlet }] }));

  const removeOutlet = (idx: number) =>
    setForm(prev => ({ ...prev, outlets: prev.outlets.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate API call

    // Save to localStorage (scaffold — swap to API later)
    const existing = JSON.parse(localStorage.getItem("lesi_submissions") || "[]");
    const submission = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: "pending_business_approval",
      ...form,
    };
    localStorage.setItem("lesi_submissions", JSON.stringify([...existing, submission]));
    localStorage.setItem("lesi_my_submission_id", submission.id);

    setSubmitting(false);
    setSubmitted(true);
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-bold text-white mb-3">Application Submitted!</h2>
          <p className="text-slate-400">Thanks, <span className="text-white font-medium">{form.ownerName}</span>. Your application for <span className="text-white font-medium">{form.businessName}</span> is now under review.</p>
        </motion.div>

        {/* Status Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Pipeline</h3>

          {[
            { label: "Account Created", done: true, color: "green" },
            { label: "Business Approved", done: false, active: true, color: "blue" },
            { label: "Listing Approved", done: false, color: "slate" },
            { label: "You're Live 🎉", done: false, color: "slate" },
          ].map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                stage.done ? "bg-green-500/20 border-green-500/40 text-green-400"
                : stage.active ? "bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse"
                : "bg-white/5 border-white/10 text-slate-600"
              }`}>
                {stage.done ? "✓" : i + 1}
              </div>
              <div>
                <p className={`font-semibold text-sm ${stage.done ? "text-green-300" : stage.active ? "text-blue-300" : "text-slate-600"}`}>
                  {stage.label}
                </p>
                {stage.active && <p className="text-xs text-slate-500">Under review by our team — usually within 24–48h</p>}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-slate-500 text-sm">
          We&apos;ll notify you at <span className="text-slate-300">{form.ownerEmail}</span> once your business is approved.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          onClick={() => router.push("/")}
          className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
        >
          Back to Home
        </motion.button>
      </div>
    );
  }

  // ── Progress Bar ──
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Step indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone ? "bg-blue-600 border-blue-600 text-white"
                  : isActive ? "bg-blue-600/20 border-blue-500 text-blue-400"
                  : "bg-white/5 border-white/10 text-slate-600"
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-blue-400" : isDone ? "text-slate-300" : "text-slate-600"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress line */}
        <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={step}>
        <motion.div
          key={step}
          custom={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-6"
        >

          {/* ── Step 1: About You ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">About You</h2>
                <p className="text-slate-400 text-sm mt-1">Tell us about the person managing this listing.</p>
              </div>
              <Field label="Full Name"><TextInput value={form.ownerName} onChange={v => update("ownerName", v)} placeholder="e.g. Navindra Perera" icon={User} /></Field>
              <Field label="Your Role / Title"><TextInput value={form.ownerTitle} onChange={v => update("ownerTitle", v)} placeholder="e.g. CEO, Manager, Owner" icon={Briefcase} /></Field>
              <Field label="Phone Number"><TextInput value={form.ownerPhone} onChange={v => update("ownerPhone", v)} placeholder="+94 77 000 0000" type="tel" icon={Phone} /></Field>
              <Field label="Contact Email"><TextInput value={form.ownerEmail} onChange={v => update("ownerEmail", v)} placeholder="you@yourbusiness.com" type="email" icon={Mail} /></Field>
            </div>
          )}

          {/* ── Step 2: Business Info ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Business</h2>
                <p className="text-slate-400 text-sm mt-1">Tell customers what your brand is all about.</p>
              </div>
              <Field label="Business / Brand Name"><TextInput value={form.businessName} onChange={v => update("businessName", v)} placeholder="e.g. Glam Studio" icon={Building2} /></Field>
              <Field label="Primary Category">
                <select
                  value={form.category}
                  onChange={e => update("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                >
                  <option value="" disabled className="bg-[#111]">Select a category…</option>
                  {BUSINESS_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </Field>
              <Field label="Short Description">
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="A brief, compelling description of your business (2–3 sentences)…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
                />
              </Field>
              <Field label="Website (optional)"><TextInput value={form.website} onChange={v => update("website", v)} placeholder="https://yourbusiness.com" icon={Globe} /></Field>
            </div>
          )}

          {/* ── Step 3: Outlets ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Outlets & Branches</h2>
                <p className="text-slate-400 text-sm mt-1">Add all your locations. You can add more later.</p>
              </div>

              <div className="space-y-5">
                {form.outlets.map((outlet, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                        Outlet {idx + 1}
                      </span>
                      {form.outlets.length > 1 && (
                        <button onClick={() => removeOutlet(idx)} className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Outlet Name"><TextInput value={outlet.name} onChange={v => updateOutlet(idx, "name", v)} placeholder="e.g. Colombo 7 Branch" /></Field>
                      <Field label="Type">
                        <select value={outlet.type} onChange={e => updateOutlet(idx, "type", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm">
                          {OUTLET_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#111]">{t.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Street Address"><TextInput value={outlet.address} onChange={v => updateOutlet(idx, "address", v)} placeholder="123 Galle Road" icon={MapPin} /></Field>
                    <Field label="City"><TextInput value={outlet.city} onChange={v => updateOutlet(idx, "city", v)} placeholder="Colombo" /></Field>
                    <Field label="Operating Hours"><TextInput value={outlet.hours} onChange={v => updateOutlet(idx, "hours", v)} placeholder="Mon–Sat 9am–7pm" icon={Clock} /></Field>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={addOutlet}
                className="w-full py-3 rounded-xl border border-dashed border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Outlet
              </button>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Review & Submit</h2>
                <p className="text-slate-400 text-sm mt-1">Check everything looks good before submitting.</p>
              </div>

              {[
                {
                  title: "About You",
                  rows: [
                    ["Name", form.ownerName], ["Title", form.ownerTitle],
                    ["Phone", form.ownerPhone], ["Email", form.ownerEmail],
                  ],
                },
                {
                  title: "Business",
                  rows: [
                    ["Brand", form.businessName], ["Category", form.category],
                    ["Description", form.description], ["Website", form.website || "—"],
                  ],
                },
              ].map(section => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{section.title}</h3>
                  {section.rows.map(([label, val]) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-slate-500 text-sm w-24 shrink-0">{label}</span>
                      <span className="text-white text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outlets ({form.outlets.length})</h3>
                {form.outlets.map((o, i) => (
                  <div key={i} className="space-y-1 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <p className="text-white font-semibold text-sm">{o.name || "(Unnamed)"} <span className="text-blue-400 text-xs">— {o.type}</span></p>
                    <p className="text-slate-400 text-sm">{o.address}, {o.city}</p>
                    <p className="text-slate-500 text-xs">{o.hours}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                📋 Your listing will go through a two-stage review: <strong>Business Approval</strong> then <strong>Listing Approval</strong> — both handled by our admin team within 24–48 hours.
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            step === 1 ? "invisible" : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(s => Math.min(4, s + 1))}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-70 disabled:cursor-wait"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit Application <CheckCircle2 className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
