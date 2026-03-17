"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard, User, Phone, Building2, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Mail, MapPin,
  Calendar, Globe, Hash, Users, FileText, Upload,
  Shield, Star, Clock, BadgeCheck, ArrowRight
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string;
  nicNumber: string;
  dateOfBirth: string;
  nationality: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

interface BusinessInfo {
  businessName: string;
  registrationNumber: string;
  businessType: string;
  taxId: string;
  yearsInOperation: string;
  numberOfEmployees: string;
}

interface PaymentInfo {
  paymentMethod: string;
  referenceNumber: string;
  proofFile: File | null;
  proofPreview: string;
  agreedToTerms: boolean;
}

interface FormData {
  plan: "monthly" | "annual";
  personal: PersonalInfo;
  contact: ContactInfo;
  business: BusinessInfo;
  payment: PaymentInfo;
}

const STEPS = [
  { id: 1, label: "Plan", icon: Star },
  { id: 2, label: "Personal", icon: User },
  { id: 3, label: "Contact", icon: Phone },
  { id: 4, label: "Business", icon: Building2 },
  { id: 5, label: "Payment", icon: CreditCard },
];

const BUSINESS_TYPES = [
  "Sole Proprietorship", "Partnership", "Private Limited (Pvt Ltd)",
  "Public Limited Company", "LLC", "Franchise", "Nonprofit", "Other",
];

const PROVINCES = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa",
];

// ─── Reusable Field Components ────────────────────────────────────────────────

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>{label} {required && <span className="text-red-400">*</span>}</span>
        {error && <span className="text-red-500 normal-case tracking-normal">{error}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text", icon: Icon, hasError
}: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; icon?: React.ElementType; hasError?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${hasError ? "text-red-400" : "text-slate-400"}`} />}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 rounded-xl bg-white border ${hasError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm`}
      />
    </div>
  );
}

function SelectInput({
  value, onChange, options, placeholder, hasError
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl bg-white border ${hasError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"} text-slate-800 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm appearance-none`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialPlan = searchParams.get("plan") === "annual" ? "annual" : "monthly";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    plan: initialPlan as "monthly" | "annual",
    personal: { fullName: "", nicNumber: "", dateOfBirth: "", nationality: "Sri Lankan" },
    contact: { email: "", phone: "", whatsapp: "", streetAddress: "", city: "", province: "", postalCode: "" },
    business: { businessName: "", registrationNumber: "", businessType: "", taxId: "", yearsInOperation: "", numberOfEmployees: "" },
    payment: { paymentMethod: "bank_transfer", referenceNumber: "", proofFile: null, proofPreview: "", agreedToTerms: false },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentStep === 2) {
      if (!form.personal.fullName.trim()) newErrors.fullName = "Required";
      
      const nicRegex = /^[0-9]{9}[vVxyX]?$|^[0-9]{12}$/;
      if (!form.personal.nicNumber.trim()) {
        newErrors.nicNumber = "Required";
      } else if (!nicRegex.test(form.personal.nicNumber)) {
        newErrors.nicNumber = "Invalid NIC format";
      }

      if (!form.personal.dateOfBirth.trim()) {
        newErrors.dateOfBirth = "Required";
      } else {
        const dob = new Date(form.personal.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) {
          newErrors.dateOfBirth = "You must be at least 18 years old";
        }
      }
      
      if (!form.personal.nationality.trim()) newErrors.nationality = "Required";
    }

    if (currentStep === 3) {
      if (!form.contact.email.trim()) newErrors.email = "Required";
      else if (!emailRegex.test(form.contact.email)) newErrors.email = "Invalid format";
      
      const phoneRegex = /^(?:\+94|0)?[0-9]{9}$/;
      if (!form.contact.phone.trim()) {
        newErrors.phone = "Required";
      } else if (!phoneRegex.test(form.contact.phone.replace(/\s+/g, ''))) {
        newErrors.phone = "Invalid phone number (e.g. 0771234567 or +94771234567)";
      }
      
      if (!form.contact.streetAddress.trim()) newErrors.streetAddress = "Required";
      if (!form.contact.city.trim()) newErrors.city = "Required";
      if (!form.contact.postalCode.trim()) newErrors.postalCode = "Required";
    }

    if (currentStep === 4) {
      if (!form.business.businessName.trim()) newErrors.businessName = "Required";
      if (!form.business.businessType.trim()) newErrors.businessType = "Required";
    }

    if (currentStep === 5) {
      if (!form.payment.referenceNumber.trim()) newErrors.referenceNumber = "Required";
      if (!form.payment.proofFile) newErrors.proofFile = "Payment proof required";
      if (!form.payment.agreedToTerms) newErrors.agreedToTerms = "You must agree to terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(STEPS.length, s + 1));
    }
  };

  const updatePersonal = (key: keyof PersonalInfo, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, personal: { ...prev.personal, [key]: val } }));
  };
  const updateContact = (key: keyof ContactInfo, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [key]: val } }));
  };
  const updateBusiness = (key: keyof BusinessInfo, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, business: { ...prev.business, [key]: val } }));
  };
  const updatePayment = (key: keyof PaymentInfo, val: unknown) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, payment: { ...prev.payment, [key]: val } }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (errors.proofFile) setErrors(prev => ({ ...prev, proofFile: "" }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        payment: { ...prev.payment, proofFile: file, proofPreview: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    setErrors({});

    try {
      // 1. Upload payment proof to S3
      const file = form.payment.proofFile;
      let proofFileKey = "";
      
      if (file) {
        const fileExtension = file.name.split('.').pop();
        const timestamp = Date.now();
        const fileName = `proofs/${form.personal.nicNumber}-${timestamp}.${fileExtension}`;
        
        await uploadData({
          path: fileName,
          data: file,
          options: {
            contentType: file.type,
          }
        }).result;
        
        proofFileKey = fileName;
      }

      // 2. Save submission to DynamoDB
      const { errors: dbErrors } = await client.models.PartnerSubmission.create({
        submittedAt: new Date().toISOString(),
        status: "pending_partner_approval",
        plan: form.plan,
        planPrice: form.plan === "monthly" ? "$49/mo" : "$39/mo (billed $468/yr)",
        
        // Personal
        fullName: form.personal.fullName,
        nicNumber: form.personal.nicNumber,
        dateOfBirth: form.personal.dateOfBirth,
        nationality: form.personal.nationality,
        
        // Contact
        email: form.contact.email,
        phone: form.contact.phone,
        whatsapp: form.contact.whatsapp || null,
        streetAddress: form.contact.streetAddress,
        city: form.contact.city,
        province: form.contact.province || null,
        postalCode: form.contact.postalCode || null,
        
        // Business
        businessName: form.business.businessName,
        registrationNumber: form.business.registrationNumber || null,
        businessType: form.business.businessType,
        taxId: form.business.taxId || null,
        yearsInOperation: form.business.yearsInOperation || null,
        numberOfEmployees: form.business.numberOfEmployees || null,
        
        // Payment
        paymentMethod: form.payment.paymentMethod,
        referenceNumber: form.payment.referenceNumber,
        proofFileKey: proofFileKey || null,
      });

      if (dbErrors && dbErrors.length > 0) {
        throw new Error(dbErrors[0].message);
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to submit application. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Submitted!</h2>
          <p className="text-slate-500 text-sm">
            Thank you, <span className="font-semibold text-slate-700">{form.personal.fullName}</span>.
            Your <span className="font-semibold text-blue-600">{form.plan === "monthly" ? "Monthly Flex" : "Annual Pro"}</span> subscription
            request is now under review.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What happens next?</h3>
          {[
            { label: "Payment Submitted", done: true },
            { label: "Admin Review", active: true },
            { label: "Account Activated", done: false },
            { label: "Start Listing 🎉", done: false },
          ].map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                stage.done ? "bg-emerald-100 text-emerald-600"
                : stage.active ? "bg-blue-100 text-blue-600 animate-pulse"
                : "bg-slate-100 text-slate-400"
              }`}>
                {stage.done ? "✓" : i + 1}
              </div>
              <div>
                <p className={`font-medium text-sm ${stage.done ? "text-emerald-700" : stage.active ? "text-blue-700" : "text-slate-400"}`}>
                  {stage.label}
                </p>
                {stage.active && <p className="text-xs text-slate-400">Our team will review within 24–48 hours</p>}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm font-medium"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/partner")}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-sm font-medium shadow-md shadow-blue-500/20"
          >
            View Plans
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Progress Bar ──
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Step indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 relative">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] bg-slate-200 hidden sm:block" style={{ width: "calc(100% + 40px)" }}>
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: isDone ? "100%" : "0%" }}
                    />
                  </div>
                )}
                <button
                  onClick={() => { if (isDone) setStep(s.id); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                    isDone ? "bg-blue-600 border-blue-600 text-white cursor-pointer"
                    : isActive ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  isActive ? "text-blue-600" : isDone ? "text-blue-500" : "text-slate-400"
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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

          {/* ── Step 1: Plan Confirmation ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Confirm Your Plan</h2>
                <p className="text-slate-500 text-sm mt-1">Select the plan that best fits your business needs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { id: "monthly", name: "Monthly Flex", price: "$49", period: "/month", desc: "No commitment, cancel anytime", badge: null },
                  { id: "annual", name: "Annual Pro", price: "$39", period: "/month", desc: "Billed $468/year — Save 20%", badge: "Best Value" },
                ] as const).map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setForm(prev => ({ ...prev, plan: plan.id }))}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                      form.plan === plan.id
                        ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.plan === plan.id ? "border-blue-500" : "border-slate-300"
                      }`}>
                        {form.plan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                      <span className="font-bold text-slate-800">{plan.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                      <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-slate-500">{plan.desc}</p>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> What&apos;s included:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {["Unlimited listings & outlets", "Priority search placement", "Advanced analytics dashboard",
                    "Email & SMS reminders", "Dedicated partner support", "1-month free trial"
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Step 2: Personal Information ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                <p className="text-slate-500 text-sm mt-1">We need to verify your identity for account activation.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <Field label="Full Legal Name" required error={errors.fullName}>
                  <TextInput value={form.personal.fullName} onChange={v => updatePersonal("fullName", v)} placeholder="e.g. Navindra Perera" icon={User} hasError={!!errors.fullName} />
                </Field>
                <Field label="NIC / ID Number" required error={errors.nicNumber}>
                  <TextInput value={form.personal.nicNumber} onChange={v => updatePersonal("nicNumber", v)} placeholder="e.g. 200012345678" icon={Hash} hasError={!!errors.nicNumber} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Date of Birth" required error={errors.dateOfBirth}>
                    <TextInput value={form.personal.dateOfBirth} onChange={v => updatePersonal("dateOfBirth", v)} placeholder="" type="date" icon={Calendar} hasError={!!errors.dateOfBirth} />
                  </Field>
                  <Field label="Nationality" required error={errors.nationality}>
                    <SelectInput value={form.personal.nationality} onChange={v => updatePersonal("nationality", v)} options={["Sri Lankan", "Indian", "Other"]} placeholder="Select nationality" hasError={!!errors.nationality} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Contact Information ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Contact Information</h2>
                <p className="text-slate-500 text-sm mt-1">How should we reach you regarding your account?</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Email Address" required error={errors.email}>
                    <TextInput value={form.contact.email} onChange={v => updateContact("email", v)} placeholder="you@company.com" type="email" icon={Mail} hasError={!!errors.email} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <TextInput value={form.contact.phone} onChange={v => updateContact("phone", v)} placeholder="+94 77 000 0000" type="tel" icon={Phone} hasError={!!errors.phone} />
                  </Field>
                </div>
                <Field label="WhatsApp Number">
                  <TextInput value={form.contact.whatsapp} onChange={v => updateContact("whatsapp", v)} placeholder="+94 77 000 0000 (if different)" type="tel" icon={Phone} />
                </Field>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Mailing Address</p>
                  <div className="space-y-4">
                    <Field label="Street Address" required error={errors.streetAddress}>
                      <TextInput value={form.contact.streetAddress} onChange={v => updateContact("streetAddress", v)} placeholder="123 Galle Road" icon={MapPin} hasError={!!errors.streetAddress} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="City" required error={errors.city}>
                        <TextInput value={form.contact.city} onChange={v => updateContact("city", v)} placeholder="Colombo" hasError={!!errors.city} />
                      </Field>
                      <Field label="Province">
                        <SelectInput value={form.contact.province} onChange={v => updateContact("province", v)} options={PROVINCES} placeholder="Select..." />
                      </Field>
                      <Field label="Postal Code" required error={errors.postalCode}>
                        <TextInput value={form.contact.postalCode} onChange={v => updateContact("postalCode", v)} placeholder="00100" hasError={!!errors.postalCode} />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Business Information ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Business Information</h2>
                <p className="text-slate-500 text-sm mt-1">Tell us about your business for verification purposes.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <Field label="Business / Brand Name" required error={errors.businessName}>
                  <TextInput value={form.business.businessName} onChange={v => updateBusiness("businessName", v)} placeholder="e.g. Glam Studio" icon={Building2} hasError={!!errors.businessName} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Registration Number">
                    <TextInput value={form.business.registrationNumber} onChange={v => updateBusiness("registrationNumber", v)} placeholder="PV 12345" icon={FileText} />
                  </Field>
                  <Field label="Business Type" required error={errors.businessType}>
                    <SelectInput value={form.business.businessType} onChange={v => updateBusiness("businessType", v)} options={BUSINESS_TYPES} placeholder="Select type..." hasError={!!errors.businessType} />
                  </Field>
                </div>
                <Field label="Tax ID (TIN)">
                  <TextInput value={form.business.taxId} onChange={v => updateBusiness("taxId", v)} placeholder="Optional" icon={Hash} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Years in Operation">
                    <TextInput value={form.business.yearsInOperation} onChange={v => updateBusiness("yearsInOperation", v)} placeholder="e.g. 3" type="number" icon={Clock} />
                  </Field>
                  <Field label="Number of Employees">
                    <TextInput value={form.business.numberOfEmployees} onChange={v => updateBusiness("numberOfEmployees", v)} placeholder="e.g. 10" type="number" icon={Users} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Payment & Proof ── */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Payment</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Complete your payment and upload the proof to activate your account.
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-100">Order Summary</span>
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">
                    {form.plan === "monthly" ? "Monthly Flex" : "Annual Pro"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{form.plan === "monthly" ? "$49" : "$468"}</span>
                  <span className="text-blue-200 text-sm">
                    {form.plan === "monthly" ? "/month" : "/year ($39/mo)"}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Includes 1-month free trial
                </p>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Bank Transfer Details
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                  {[
                    ["Bank", "Bank of Ceylon"],
                    ["Account Name", "LesiBooking (Pvt) Ltd"],
                    ["Account Number", "0012 3456 7890"],
                    ["Branch", "Colombo Fort"],
                    ["Swift Code", "BCEYLKLX"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-mono font-semibold text-slate-700">{val}</span>
                    </div>
                  ))}
                </div>

                <Field label="Payment Reference Number" required error={errors.referenceNumber}>
                  <TextInput
                    value={form.payment.referenceNumber}
                    onChange={v => updatePayment("referenceNumber", v)}
                    placeholder="e.g. TXN-20260317-001"
                    icon={Hash}
                    hasError={!!errors.referenceNumber}
                  />
                </Field>
              </div>

              {/* Upload Proof */}
              <div className={`bg-white rounded-2xl border ${errors.proofFile ? "border-red-300 shadow-red-500/10" : "border-slate-200"} p-6 space-y-4 shadow-sm transition-colors`}>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-blue-500" /> Upload Payment Proof
                    <span className="text-red-400">*</span>
                  </h3>
                  {errors.proofFile && <span className="text-red-500 text-xs font-semibold">{errors.proofFile}</span>}
                </div>
                <p className="text-xs text-slate-500">
                  Upload a screenshot or photo of your bank transfer receipt (JPG, PNG, or PDF).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {form.payment.proofPreview ? (
                  <div className="relative group">
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      {form.payment.proofFile?.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.payment.proofPreview}
                          alt="Payment proof"
                          className="w-full max-h-[200px] object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-4">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-slate-700 text-sm">{form.payment.proofFile?.name}</p>
                            <p className="text-xs text-slate-400">PDF document</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-2 text-slate-500 hover:text-blue-600 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Click to upload receipt</span>
                    <span className="text-xs text-slate-400">JPG, PNG, or PDF — Max 10 MB</span>
                  </button>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.payment.agreedToTerms}
                    onChange={e => updatePayment("agreedToTerms", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    I confirm the payment has been made and agree to LesiBooking&apos;s{" "}
                    <span className="text-blue-600 font-medium hover:underline cursor-pointer">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-blue-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
                  </span>
                </label>
                {errors.agreedToTerms && <p className="text-red-500 text-xs font-semibold ml-7">{errors.agreedToTerms}</p>}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            step === 1 ? "invisible" : "text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < 5 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.payment.agreedToTerms || !form.payment.referenceNumber}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            ) : (
              <><BadgeCheck className="w-4 h-4" /> Submit Payment</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
