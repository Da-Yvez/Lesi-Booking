"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard, User, Phone, Building2, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Mail,
  Calendar, Globe, Hash, Users, FileText, Upload,
  Shield, Star, Clock, BadgeCheck, ArrowRight, AlertTriangle
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";
import Link from "next/link";

const client = generateClient<Schema>();

// ─── Types ────────────────────────────────────────────────────────────────────

// A. Owner Identity
interface OwnerIdentity {
  fullName: string;
  nicNumber: string;
  dateOfBirth: string;
  nationality: string;
  ownerRole: string;
}

// B. Business Legal Identity
interface BusinessIdentity {
  businessLegalName: string;
  businessBrandName: string;
  registrationNumber: string;
  legalStructure: string;
  taxId: string;
  countryOfRegistration: string;
  yearsInOperation: string;
}

// C & D. Contact & Presence
interface ContactPresence {
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  province: string;
  country: string;
  hasPhysicalLocation: boolean;
  numberOfBranches: string;
}

// E. Business Profile
interface BusinessProfile {
  category: string;
  shortDescription: string;
  targetCustomers: string;
}

// F. Compliance & Documents
interface ComplianceDocs {
  registrationFile: File | null;
  ownerNicFile: File | null;
  taxFile: File | null;
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
  owner: OwnerIdentity;
  businessInfo: BusinessIdentity;
  contact: ContactPresence;
  profile: BusinessProfile;
  docs: ComplianceDocs;
  payment: PaymentInfo;
}

const STEPS = [
  { id: 1, label: "Plan", icon: Star },
  { id: 2, label: "Owner", icon: User },
  { id: 3, label: "Legal", icon: Building2 },
  { id: 4, label: "Contact", icon: Phone },
  { id: 5, label: "Profile", icon: Globe },
  { id: 6, label: "Payment", icon: CreditCard },
];

const APPROVED_STEPS = [
  { id: 1, label: "Plan", icon: Star },
  { id: 2, label: "Summary", icon: Building2 },
  { id: 3, label: "Payment", icon: CreditCard },
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

export default function CheckoutForm({ businessReg, ownerEmail }: { businessReg?: any, ownerEmail?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isApprovedBusiness = businessReg?.status === "business_approved";
  const activeSteps = isApprovedBusiness ? APPROVED_STEPS : STEPS;
  const lastStep = activeSteps.length;

  const initialPlan = searchParams.get("plan") === "annual" ? "annual" : "monthly";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    plan: initialPlan as "monthly" | "annual",
    owner: { fullName: "", nicNumber: "", dateOfBirth: "", nationality: "Sri Lankan", ownerRole: "" },
    businessInfo: { businessLegalName: "", businessBrandName: "", registrationNumber: "", legalStructure: "", taxId: "", countryOfRegistration: "Sri Lanka", yearsInOperation: "" },
    contact: { email: "", phone: "", whatsapp: "", city: "", province: "", country: "Sri Lanka", hasPhysicalLocation: true, numberOfBranches: "" },
    profile: { category: "", shortDescription: "", targetCustomers: "" },
    docs: { registrationFile: null, ownerNicFile: null, taxFile: null },
    payment: { paymentMethod: "bank_transfer", referenceNumber: "", proofFile: null, proofPreview: "", agreedToTerms: false },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // In approved-business mode, steps are: 1=Plan, 2=Summary, 3=Payment
    // Step 2 (Summary) needs no validation — it's all read-only.
    // We shift the validation to match original step numbers.
    const effectiveStep = isApprovedBusiness
      ? currentStep === 3 ? 6 : -1  // only validate payment step
      : currentStep;

    if (effectiveStep === 2) {
      if (!form.owner.fullName.trim()) newErrors.fullName = "Required";
      
      const nicRegex = /^[0-9]{9}[vVxyX]?$|^[0-9]{12}$/;
      if (!form.owner.nicNumber.trim()) {
        newErrors.nicNumber = "Required";
      } else if (!nicRegex.test(form.owner.nicNumber)) {
        newErrors.nicNumber = "Invalid NIC format";
      }

      if (!form.owner.dateOfBirth.trim()) {
        newErrors.dateOfBirth = "Required";
      } else {
        const dob = new Date(form.owner.dateOfBirth);
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
      
      if (!form.owner.nationality.trim()) newErrors.nationality = "Required";
      if (!form.owner.ownerRole.trim()) newErrors.ownerRole = "Required";
    }

    if (effectiveStep === 3) {
      if (!form.businessInfo.businessLegalName.trim()) newErrors.businessLegalName = "Required";
      if (!form.businessInfo.businessBrandName.trim()) newErrors.businessBrandName = "Required";
      if (!form.businessInfo.legalStructure.trim()) newErrors.legalStructure = "Required";
      if (!form.businessInfo.countryOfRegistration.trim()) newErrors.countryOfRegistration = "Required";
    }

    if (effectiveStep === 4) {
      if (!form.contact.email.trim()) newErrors.email = "Required";
      else if (!emailRegex.test(form.contact.email)) newErrors.email = "Invalid format";
      
      const phoneRegex = /^(?:\+94|0)?[0-9]{9}$/;
      if (!form.contact.phone.trim()) {
        newErrors.phone = "Required";
      } else if (!phoneRegex.test(form.contact.phone.replace(/\s+/g, ''))) {
        newErrors.phone = "Invalid phone number";
      }
      
      if (!form.contact.city.trim()) newErrors.city = "Required";
      if (!form.contact.province.trim()) newErrors.province = "Required";
      if (!form.contact.country.trim()) newErrors.country = "Required";
    }

    if (effectiveStep === 5) {
      if (!form.profile.category.trim()) newErrors.category = "Required";
    }

    if (effectiveStep === 6) {
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

  const updateOwner = (key: keyof OwnerIdentity, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, owner: { ...prev.owner, [key]: val } }));
  };
  const updateBusiness = (key: keyof BusinessIdentity, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, businessInfo: { ...prev.businessInfo, [key]: val } }));
  };
  const updateContact = (key: keyof ContactPresence, val: string | boolean) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [key]: val } }));
  };
  const updateProfile = (key: keyof BusinessProfile, val: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, profile: { ...prev.profile, [key]: val } }));
  };
  const updateDocs = (key: keyof ComplianceDocs, file: File | null) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, docs: { ...prev.docs, [key]: file } }));
  };
  const updatePayment = (key: keyof PaymentInfo, val: unknown) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    setForm(prev => ({ ...prev, payment: { ...prev.payment, [key]: val } }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, proofFile: "File size must be less than 10MB" }));
        return;
      }
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : "";
      
      setForm(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          proofFile: file,
          proofPreview: previewUrl
        }
      }));
      setErrors(prev => ({ ...prev, proofFile: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setSubmitting(true);
    setErrors({});

    try {
      const timestamp = Date.now();
      const nic = form.owner.nicNumber;

      // 1. Upload Optional Docs (Concurrency)
      const uploadPromises = [];
      let proofFileKey = "";
      let registrationFileKey = "";
      let ownerNicFileKey = "";
      let taxFileKey = "";

      if (form.payment.proofFile) {
        const ext = form.payment.proofFile.name.split('.').pop();
        proofFileKey = `proofs/${nic}-payment-${timestamp}.${ext}`;
        uploadPromises.push(uploadData({ path: proofFileKey, data: form.payment.proofFile, options: { contentType: form.payment.proofFile.type } }).result);
      }
      if (form.docs.registrationFile) {
        const ext = form.docs.registrationFile.name.split('.').pop();
        registrationFileKey = `docs/${nic}-reg-${timestamp}.${ext}`;
        uploadPromises.push(uploadData({ path: registrationFileKey, data: form.docs.registrationFile, options: { contentType: form.docs.registrationFile.type } }).result);
      }
      if (form.docs.ownerNicFile) {
        const ext = form.docs.ownerNicFile.name.split('.').pop();
        ownerNicFileKey = `docs/${nic}-owner-${timestamp}.${ext}`;
        uploadPromises.push(uploadData({ path: ownerNicFileKey, data: form.docs.ownerNicFile, options: { contentType: form.docs.ownerNicFile.type } }).result);
      }
      if (form.docs.taxFile) {
        const ext = form.docs.taxFile.name.split('.').pop();
        taxFileKey = `docs/${nic}-tax-${timestamp}.${ext}`;
        uploadPromises.push(uploadData({ path: taxFileKey, data: form.docs.taxFile, options: { contentType: form.docs.taxFile.type } }).result);
      }

      await Promise.all(uploadPromises);

      // 2. Save submission to DynamoDB
      const { errors: dbErrors } = await client.models.PartnerSubmission.create({
        ownerEmail: ownerEmail || form.contact.email, // fallback
        businessRegistrationId: businessReg?.id || null,
        submittedAt: new Date().toISOString(),
        status: "pending_partner_approval",
        plan: form.plan,
        planPrice: form.plan === "monthly" ? "$49/mo" : "$39/mo (billed $468/yr)",
        
        // A. Owner
        fullName: form.owner.fullName,
        nicNumber: form.owner.nicNumber,
        dateOfBirth: form.owner.dateOfBirth,
        nationality: form.owner.nationality,
        ownerRole: form.owner.ownerRole,
        
        // B. Business Legal
        businessLegalName: form.businessInfo.businessLegalName,
        businessBrandName: form.businessInfo.businessBrandName,
        registrationNumber: form.businessInfo.registrationNumber || null,
        legalStructure: form.businessInfo.legalStructure,
        taxId: form.businessInfo.taxId || null,
        countryOfRegistration: form.businessInfo.countryOfRegistration,
        yearsInOperation: form.businessInfo.yearsInOperation || null,
        
        // C & D. Contact & Presence
        email: form.contact.email,
        phone: form.contact.phone,
        whatsapp: form.contact.whatsapp || null,
        city: form.contact.city,
        province: form.contact.province,
        country: form.contact.country,
        hasPhysicalLocation: form.contact.hasPhysicalLocation,
        numberOfBranches: form.contact.numberOfBranches || null,
        
        // E. Profile
        category: form.profile.category,
        shortDescription: form.profile.shortDescription || null,
        targetCustomers: form.profile.targetCustomers || null,
        
        // F. Documents
        proofFileKey: proofFileKey || null,
        registrationFileKey: registrationFileKey || null,
        ownerNicFileKey: ownerNicFileKey || null,
        taxFileKey: taxFileKey || null,
        
        // Payment
        paymentMethod: form.payment.paymentMethod,
        referenceNumber: form.payment.referenceNumber,
      });

      if (dbErrors && dbErrors.length > 0) throw new Error(dbErrors[0].message);

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
            Thank you, <span className="font-semibold text-slate-700">{form.owner.fullName}</span>.
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
  const progress = ((step - 1) / (activeSteps.length - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* No business warning banner */}
      {!isApprovedBusiness && !businessReg && (
        <div className="mb-8 flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Business Registration Required</p>
            <p className="text-xs text-amber-700 mt-0.5">You need to register and get your business approved before purchasing a partner plan.</p>
          </div>
          <Link href="/partner/dashboard/info"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shrink-0">
            Register Business <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Step indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          {activeSteps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 relative">
                {/* Connector line */}
                {idx < activeSteps.length - 1 && (
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

          {/* ── Business Summary Step (Approved mode: step 2) ── */}
          {isApprovedBusiness && step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Business Verified ✓</h2>
                <p className="text-slate-500 text-sm mt-1">Your business has been verified. Review the details below before proceeding to payment.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-emerald-800">{businessReg?.businessBrandName || businessReg?.businessLegalName}</p>
                  <p className="text-emerald-700 text-sm">{businessReg?.category} · {businessReg?.city}, {businessReg?.province}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ["Owner", businessReg?.fullName],
                    ["Role", businessReg?.ownerRole],
                    ["NIC", businessReg?.nicNumber],
                    ["Legal Name", businessReg?.businessLegalName],
                    ["Structure", businessReg?.legalStructure],
                    ["Registration No.", businessReg?.registrationNumber || "N/A"],
                    ["Email", businessReg?.email],
                    ["Phone", businessReg?.phone],
                    ["City", businessReg?.city],
                    ["Province", businessReg?.province],
                  ].map(([label, val]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                      <span className="text-slate-700 font-medium">{val || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Owner Identity (6-step / no approved biz mode) ── */}
          {!isApprovedBusiness && step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Owner Identity (KYC)</h2>
                <p className="text-slate-500 text-sm mt-1">We need to verify the primary owner&apos;s identity for compliance.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <Field label="Full Legal Name" required error={errors.fullName}>
                  <TextInput value={form.owner.fullName} onChange={v => updateOwner("fullName", v)} placeholder="e.g. Navindra Perera" icon={User} hasError={!!errors.fullName} />
                </Field>
                <Field label="NIC / ID Number" required error={errors.nicNumber}>
                  <TextInput value={form.owner.nicNumber} onChange={v => updateOwner("nicNumber", v)} placeholder="e.g. 200012345678" icon={Hash} hasError={!!errors.nicNumber} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Date of Birth" required error={errors.dateOfBirth}>
                    <TextInput value={form.owner.dateOfBirth} onChange={v => updateOwner("dateOfBirth", v)} placeholder="" type="date" icon={Calendar} hasError={!!errors.dateOfBirth} />
                  </Field>
                  <Field label="Nationality" required error={errors.nationality}>
                    <SelectInput value={form.owner.nationality} onChange={v => updateOwner("nationality", v)} options={["Sri Lankan", "Indian", "Other"]} placeholder="Select nationality" hasError={!!errors.nationality} />
                  </Field>
                </div>
                <Field label="Role in Business" required error={errors.ownerRole}>
                   <SelectInput value={form.owner.ownerRole} onChange={v => updateOwner("ownerRole", v)} options={["Owner", "Director", "Manager"]} placeholder="Select your role" hasError={!!errors.ownerRole} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 3: Business Legal Identity ── */}
          {!isApprovedBusiness && step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Business Legal Identity</h2>
                <p className="text-slate-500 text-sm mt-1">Firmographic data required for platform onboarding.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <Field label="Business Legal Name" required error={errors.businessLegalName}>
                  <TextInput value={form.businessInfo.businessLegalName} onChange={v => updateBusiness("businessLegalName", v)} placeholder="e.g. Glam Studio Pvt Ltd" icon={Building2} hasError={!!errors.businessLegalName} />
                </Field>
                <Field label="Business Brand Name" required error={errors.businessBrandName}>
                  <TextInput value={form.businessInfo.businessBrandName} onChange={v => updateBusiness("businessBrandName", v)} placeholder="e.g. Glam Studio" icon={Star} hasError={!!errors.businessBrandName} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Registration Number">
                    <TextInput value={form.businessInfo.registrationNumber} onChange={v => updateBusiness("registrationNumber", v)} placeholder="PV 12345" icon={FileText} />
                  </Field>
                  <Field label="Legal Structure" required error={errors.legalStructure}>
                    <SelectInput value={form.businessInfo.legalStructure} onChange={v => updateBusiness("legalStructure", v)} options={["Sole Proprietorship", "Partnership", "Private Limited (Pvt Ltd)", "LLC", "Nonprofit", "Other"]} placeholder="Select structure..." hasError={!!errors.legalStructure} />
                  </Field>
                </div>
                <Field label="Tax ID (TIN)">
                  <TextInput value={form.businessInfo.taxId} onChange={v => updateBusiness("taxId", v)} placeholder="Optional" icon={Hash} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Country of Registration" required error={errors.countryOfRegistration}>
                     <SelectInput value={form.businessInfo.countryOfRegistration} onChange={v => updateBusiness("countryOfRegistration", v)} options={["Sri Lanka", "India", "Other"]} placeholder="Select Country" hasError={!!errors.countryOfRegistration} />
                  </Field>
                  <Field label="Years in Operation">
                    <TextInput value={form.businessInfo.yearsInOperation} onChange={v => updateBusiness("yearsInOperation", v)} placeholder="e.g. 3" type="number" icon={Clock} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Contact & Presence ── */}
          {!isApprovedBusiness && step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Contact & Presence</h2>
                <p className="text-slate-500 text-sm mt-1">Primary details for verification and platform listing.</p>
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
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Location</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="City" required error={errors.city}>
                      <TextInput value={form.contact.city} onChange={v => updateContact("city", v)} placeholder="Colombo" hasError={!!errors.city} />
                    </Field>
                    <Field label="Province" required error={errors.province}>
                      <SelectInput value={form.contact.province} onChange={v => updateContact("province", v)} options={PROVINCES} placeholder="Select..." hasError={!!errors.province} />
                    </Field>
                    <Field label="Country" required error={errors.country}>
                      <SelectInput value={form.contact.country} onChange={v => updateContact("country", v)} options={["Sri Lanka"]} placeholder="Select..." hasError={!!errors.country} />
                    </Field>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 pt-2">
                       <label className="flex items-center gap-3 cursor-pointer select-none">
                         <input
                           type="checkbox"
                           checked={form.contact.hasPhysicalLocation}
                           onChange={e => updateContact("hasPhysicalLocation", e.target.checked)}
                           className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                         />
                         <span className="text-sm font-medium text-slate-700">Has Physical Location?</span>
                       </label>
                    </div>
                    {form.contact.hasPhysicalLocation && (
                      <Field label="Number of Branches">
                        <TextInput value={form.contact.numberOfBranches} onChange={v => updateContact("numberOfBranches", v)} placeholder="e.g. 1" type="number" />
                      </Field>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* ── Step 5: Business Profile & Documents ── */}
          {!isApprovedBusiness && step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Profile & Compliance</h2>
                <p className="text-slate-500 text-sm mt-1">Set up your public profile and upload verification documents.</p>
              </div>

              {/* Business Profile */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800">— Business Profile</h3>
                <Field label="Business Category" required error={errors.category}>
                  <SelectInput value={form.profile.category} onChange={v => updateProfile("category", v)} options={["Salon & Spa", "Healthcare", "Fitness", "Professional Services", "Other"]} placeholder="Select primary category" hasError={!!errors.category} />
                </Field>
                <Field label="Short Description">
                  <textarea
                    value={form.profile.shortDescription}
                    onChange={e => updateProfile("shortDescription", e.target.value)}
                    placeholder="1-2 lines describing what your business does..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm min-h-[80px]"
                  />
                </Field>
                <Field label="Target Customers">
                  <SelectInput value={form.profile.targetCustomers} onChange={v => updateProfile("targetCustomers", v)} options={["Walk-in only", "Online appointments only", "Both"]} placeholder="Select customer channel" />
                </Field>
              </div>

              {/* Compliance Documents */}
              <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/30 p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                   <Shield className="w-4 h-4 text-blue-600" />
                   <h3 className="text-sm font-bold text-slate-800">Compliance Documents (Optional for now)</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Uploading these documents speeds up your verification process and builds trust with users. Files must be JPG, PNG, or PDF under 5MB.</p>
                
                <div className="space-y-4">
                  {[
                    { key: "registrationFile" as keyof ComplianceDocs, label: "Business Registration Certificate" },
                    { key: "ownerNicFile" as keyof ComplianceDocs, label: "Owner NIC / ID (Front & Back)" },
                    { key: "taxFile" as keyof ComplianceDocs, label: "Tax Document (TIN Certificate)" }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${form.docs[key] ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">{label}</p>
                          {form.docs[key] && <p className="text-xs text-emerald-600 font-medium truncate max-w-[200px]">{form.docs[key]?.name}</p>}
                        </div>
                      </div>
                      <label className="cursor-pointer px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors shrink-0 text-center">
                        {form.docs[key] ? "Change File" : "Select File"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => updateDocs(key, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Payment & Proof ── */}
          {step === lastStep && (
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

        {step < lastStep ? (
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
