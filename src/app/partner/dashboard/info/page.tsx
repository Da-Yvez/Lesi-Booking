"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/business/DashboardLayout";
import { getAuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "../../../../../amplify/data/resource";
import {
  User, Building2, Phone, Mail, Globe, Hash, FileText,
  Upload, Shield, Clock, CheckCircle2, AlertCircle, Info,
  Save, Loader2, ArrowRight, MapPin, Calendar, Star
} from "lucide-react";

const client = generateClient<Schema>();

const PROVINCES = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa",
];

const BUSINESS_TYPES = [
  "Sole Proprietorship", "Partnership", "Private Limited (Pvt Ltd)",
  "Public Limited Company", "LLC", "Franchise", "Nonprofit", "Other",
];

const CATEGORIES = ["Salon & Spa", "Healthcare", "Fitness", "Professional Services", "Other"];

// ─── Reusable Field Components ──────────────────────────────────────────────
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>{label} {required && <span className="text-red-400">*</span>}</span>
        {error && <span className="text-red-500 normal-case tracking-normal font-normal">{error}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", icon: Icon, hasError, disabled }: {
  value: string; onChange?: (v: string) => void; placeholder: string;
  type?: string; icon?: React.ElementType; hasError?: boolean; disabled?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${hasError ? "text-red-400" : "text-slate-400"}`} />}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 rounded-xl bg-white border ${hasError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm disabled:bg-slate-50 disabled:text-slate-500`}
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder, hasError, disabled }: {
  value: string; onChange?: (v: string) => void; options: string[]; placeholder: string; hasError?: boolean; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl bg-white border ${hasError ? "border-red-300" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"} text-slate-800 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm appearance-none disabled:bg-slate-50 disabled:text-slate-500`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Status Banner ───────────────────────────────────────────────────────────
function StatusBanner({ status }: { status: string }) {
  if (status === "pending_business_approval") {
    return (
      <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
        <Info className="text-amber-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-semibold text-amber-800">Pending Approval</p>
          <p className="text-sm text-amber-700 mt-0.5">Your business information has been submitted and is under review. Our team usually responds within 24–48 hours.</p>
        </div>
      </div>
    );
  }
  if (status === "business_approved") {
    return (
      <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-semibold text-emerald-800">Business Approved!</p>
          <p className="text-sm text-emerald-700 mt-0.5">Your business is verified. You can now purchase a Partner Plan to start listing your services.</p>
          <a href="/partner/checkout" className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all">
            Buy Partner Plan <ArrowRight size={14} />
          </a>
        </div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-semibold text-red-800">Submission Rejected</p>
          <p className="text-sm text-red-700 mt-0.5">Your application was not approved. Please update your information and re-submit.</p>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BusinessInfoPage() {
  const [authEmail, setAuthEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("Sri Lankan");
  const [ownerRole, setOwnerRole] = useState("");

  const [businessLegalName, setBusinessLegalName] = useState("");
  const [businessBrandName, setBusinessBrandName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [legalStructure, setLegalStructure] = useState("");
  const [taxId, setTaxId] = useState("");
  const [countryOfRegistration, setCountryOfRegistration] = useState("Sri Lanka");
  const [yearsInOperation, setYearsInOperation] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [hasPhysical, setHasPhysical] = useState(true);
  const [numberOfBranches, setNumberOfBranches] = useState("");

  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [targetCustomers, setTargetCustomers] = useState("");

  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [ownerNicFile, setOwnerNicFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);

  // Is the form editable?
  const isReadOnly = existingStatus === "pending_business_approval" || existingStatus === "business_approved";

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      if (!state.authed) return;
      setAuthEmail(state.email);

      try {
        const { data } = await client.models.BusinessRegistration.list({
          filter: { ownerEmail: { eq: state.email } }
        });
        if (data && data.length > 0) {
          const reg = data[0];
          setExistingId(reg.id);
          setExistingStatus(reg.status ?? null);
          // Populate form
          setFullName(reg.fullName ?? "");
          setNicNumber(reg.nicNumber ?? "");
          setDateOfBirth(reg.dateOfBirth ?? "");
          setNationality(reg.nationality ?? "Sri Lankan");
          setOwnerRole(reg.ownerRole ?? "");
          setBusinessLegalName(reg.businessLegalName ?? "");
          setBusinessBrandName(reg.businessBrandName ?? "");
          setRegistrationNumber(reg.registrationNumber ?? "");
          setLegalStructure(reg.legalStructure ?? "");
          setTaxId(reg.taxId ?? "");
          setCountryOfRegistration(reg.countryOfRegistration ?? "Sri Lanka");
          setYearsInOperation(reg.yearsInOperation ?? "");
          setEmail(reg.email ?? "");
          setPhone(reg.phone ?? "");
          setWhatsapp(reg.whatsapp ?? "");
          setCity(reg.city ?? "");
          setProvince(reg.province ?? "");
          setCountry(reg.country ?? "Sri Lanka");
          setHasPhysical(reg.hasPhysicalLocation ?? true);
          setNumberOfBranches(reg.numberOfBranches ?? "");
          setCategory(reg.category ?? "");
          setShortDescription(reg.shortDescription ?? "");
          setTargetCustomers(reg.targetCustomers ?? "");
        }
      } catch (err) {
        console.error("Error fetching business registration:", err);
      }
      setLoading(false);
    }
    init();
  }, []);

  const validate = (): boolean => {
    const newErr: Record<string, string> = {};
    if (!fullName.trim()) newErr.fullName = "Required";
    const nicReg = /^[0-9]{9}[vVxyX]?$|^[0-9]{12}$/;
    if (!nicNumber.trim()) newErr.nicNumber = "Required";
    else if (!nicReg.test(nicNumber)) newErr.nicNumber = "Invalid format";
    if (!dateOfBirth) newErr.dateOfBirth = "Required";
    if (!ownerRole) newErr.ownerRole = "Required";
    if (!businessLegalName.trim()) newErr.businessLegalName = "Required";
    if (!businessBrandName.trim()) newErr.businessBrandName = "Required";
    if (!legalStructure) newErr.legalStructure = "Required";
    if (!email.trim()) newErr.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErr.email = "Invalid format";
    if (!phone.trim()) newErr.phone = "Required";
    if (!city.trim()) newErr.city = "Required";
    if (!province) newErr.province = "Required";
    if (!category) newErr.category = "Required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const timestamp = Date.now();
      const nic = nicNumber;
      let regFileKey = "";
      let nicFileKey = "";
      let taxFileKey = "";
      const uploads: Promise<unknown>[] = [];

      if (registrationFile) {
        const ext = registrationFile.name.split(".").pop();
        regFileKey = `biz-docs/${nic}-reg-${timestamp}.${ext}`;
        uploads.push(uploadData({ path: regFileKey, data: registrationFile, options: { contentType: registrationFile.type } }).result);
      }
      if (ownerNicFile) {
        const ext = ownerNicFile.name.split(".").pop();
        nicFileKey = `biz-docs/${nic}-nic-${timestamp}.${ext}`;
        uploads.push(uploadData({ path: nicFileKey, data: ownerNicFile, options: { contentType: ownerNicFile.type } }).result);
      }
      if (taxFile) {
        const ext = taxFile.name.split(".").pop();
        taxFileKey = `biz-docs/${nic}-tax-${timestamp}.${ext}`;
        uploads.push(uploadData({ path: taxFileKey, data: taxFile, options: { contentType: taxFile.type } }).result);
      }
      await Promise.all(uploads);

      const payload = {
        ownerEmail: authEmail,
        submittedAt: new Date().toISOString(),
        status: "pending_business_approval" as const,
        fullName, nicNumber, dateOfBirth, nationality, ownerRole,
        businessLegalName, businessBrandName,
        registrationNumber: registrationNumber || null,
        legalStructure,
        taxId: taxId || null,
        countryOfRegistration,
        yearsInOperation: yearsInOperation || null,
        email, phone,
        whatsapp: whatsapp || null,
        city, province, country,
        hasPhysicalLocation: hasPhysical,
        numberOfBranches: numberOfBranches || null,
        category,
        shortDescription: shortDescription || null,
        targetCustomers: targetCustomers || null,
        registrationFileKey: regFileKey || null,
        ownerNicFileKey: nicFileKey || null,
        taxFileKey: taxFileKey || null,
      };

      if (existingId) {
        await client.models.BusinessRegistration.update({ id: existingId, ...payload });
        setExistingStatus("pending_business_approval");
      } else {
        const { data } = await client.models.BusinessRegistration.create(payload);
        if (data) { setExistingId(data.id); setExistingStatus("pending_business_approval"); }
      }

      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
        <Icon size={18} className="text-blue-600" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl shadow-slate-900/40"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-400 w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Submission Successful</p>
              <p className="text-xs text-slate-400">Your business info is now under review.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Business Information</h1>
          <p className="text-gray-500">Fill out your business details and submit for admin approval before purchasing a partner plan.</p>
        </div>

        {/* Status Banner */}
        {existingStatus && <StatusBanner status={existingStatus} />}

        {/* No submission yet — info banner */}
        {!existingStatus && (
          <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
            <Info className="text-blue-500 mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-blue-800">Complete your business registration</p>
              <p className="text-sm text-blue-700 mt-0.5">Fill out all sections below and click &quot;Submit for Approval&quot;. Once approved, you can purchase a Partner Plan.</p>
            </div>
          </div>
        )}

        {/* ── Section 1: Owner Identity ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <SectionHeader icon={User} title="Owner Identity (KYC)" subtitle="Primary owner details for compliance verification" />
          <div className="space-y-5">
            <Field label="Full Legal Name" required error={errors.fullName}>
              <TextInput value={fullName} onChange={setFullName} placeholder="e.g. Navindra Perera" icon={User} hasError={!!errors.fullName} disabled={isReadOnly} />
            </Field>
            <Field label="NIC / ID Number" required error={errors.nicNumber}>
              <TextInput value={nicNumber} onChange={setNicNumber} placeholder="e.g. 200012345678" icon={Hash} hasError={!!errors.nicNumber} disabled={isReadOnly} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Date of Birth" required error={errors.dateOfBirth}>
                <TextInput value={dateOfBirth} onChange={setDateOfBirth} placeholder="" type="date" icon={Calendar} hasError={!!errors.dateOfBirth} disabled={isReadOnly} />
              </Field>
              <Field label="Nationality" required>
                <SelectInput value={nationality} onChange={setNationality} options={["Sri Lankan", "Indian", "Other"]} placeholder="Select nationality" disabled={isReadOnly} />
              </Field>
            </div>
            <Field label="Role in Business" required error={errors.ownerRole}>
              <SelectInput value={ownerRole} onChange={setOwnerRole} options={["Owner", "Director", "Manager"]} placeholder="Select your role" hasError={!!errors.ownerRole} disabled={isReadOnly} />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Business Legal Identity ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <SectionHeader icon={Building2} title="Business Legal Identity" subtitle="Firmographic data required for platform onboarding" />
          <div className="space-y-5">
            <Field label="Business Legal Name" required error={errors.businessLegalName}>
              <TextInput value={businessLegalName} onChange={setBusinessLegalName} placeholder="e.g. Glam Studio Pvt Ltd" icon={Building2} hasError={!!errors.businessLegalName} disabled={isReadOnly} />
            </Field>
            <Field label="Business Brand Name" required error={errors.businessBrandName}>
              <TextInput value={businessBrandName} onChange={setBusinessBrandName} placeholder="e.g. Glam Studio" icon={Star} hasError={!!errors.businessBrandName} disabled={isReadOnly} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Registration Number">
                <TextInput value={registrationNumber} onChange={setRegistrationNumber} placeholder="PV 12345" icon={FileText} disabled={isReadOnly} />
              </Field>
              <Field label="Legal Structure" required error={errors.legalStructure}>
                <SelectInput value={legalStructure} onChange={setLegalStructure} options={BUSINESS_TYPES} placeholder="Select structure..." hasError={!!errors.legalStructure} disabled={isReadOnly} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Tax ID (TIN)">
                <TextInput value={taxId} onChange={setTaxId} placeholder="Optional" icon={Hash} disabled={isReadOnly} />
              </Field>
              <Field label="Country of Registration" required>
                <SelectInput value={countryOfRegistration} onChange={setCountryOfRegistration} options={["Sri Lanka", "India", "Other"]} placeholder="Select Country" disabled={isReadOnly} />
              </Field>
              <Field label="Years in Operation">
                <TextInput value={yearsInOperation} onChange={setYearsInOperation} placeholder="e.g. 3" type="number" icon={Clock} disabled={isReadOnly} />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Section 3: Contact & Presence ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <SectionHeader icon={Phone} title="Contact & Presence" subtitle="Primary contact details for verification and listing" />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Email Address" required error={errors.email}>
                <TextInput value={email} onChange={setEmail} placeholder="you@company.com" type="email" icon={Mail} hasError={!!errors.email} disabled={isReadOnly} />
              </Field>
              <Field label="Phone Number" required error={errors.phone}>
                <TextInput value={phone} onChange={setPhone} placeholder="+94 77 000 0000" type="tel" icon={Phone} hasError={!!errors.phone} disabled={isReadOnly} />
              </Field>
            </div>
            <Field label="WhatsApp Number">
              <TextInput value={whatsapp} onChange={setWhatsapp} placeholder="+94 77 000 0000 (if different)" type="tel" icon={Phone} disabled={isReadOnly} />
            </Field>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City" required error={errors.city}>
                  <TextInput value={city} onChange={setCity} placeholder="Colombo" icon={MapPin} hasError={!!errors.city} disabled={isReadOnly} />
                </Field>
                <Field label="Province" required error={errors.province}>
                  <SelectInput value={province} onChange={setProvince} options={PROVINCES} placeholder="Select..." hasError={!!errors.province} disabled={isReadOnly} />
                </Field>
                <Field label="Country" required>
                  <SelectInput value={country} onChange={setCountry} options={["Sri Lanka"]} placeholder="Select..." disabled={isReadOnly} />
                </Field>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <input type="checkbox" id="hasPhysical" checked={hasPhysical} onChange={e => setHasPhysical(e.target.checked)} disabled={isReadOnly}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="hasPhysical" className="text-sm font-medium text-gray-700">Has Physical Location?</label>
              </div>
              {hasPhysical && (
                <div className="mt-4 max-w-xs">
                  <Field label="Number of Branches">
                    <TextInput value={numberOfBranches} onChange={setNumberOfBranches} placeholder="e.g. 1" type="number" disabled={isReadOnly} />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4: Business Profile ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <SectionHeader icon={Globe} title="Business Profile" subtitle="Public-facing info shown on your listings" />
          <div className="space-y-5">
            <Field label="Business Category" required error={errors.category}>
              <SelectInput value={category} onChange={setCategory} options={CATEGORIES} placeholder="Select primary category" hasError={!!errors.category} disabled={isReadOnly} />
            </Field>
            <Field label="Short Description">
              <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} disabled={isReadOnly}
                placeholder="1-2 lines describing what your business does..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm shadow-sm min-h-[80px] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </Field>
            <Field label="Target Customers">
              <SelectInput value={targetCustomers} onChange={setTargetCustomers} options={["Walk-in only", "Online appointments only", "Both"]} placeholder="Select customer channel" disabled={isReadOnly} />
            </Field>
          </div>
        </div>

        {/* ── Section 5: Compliance Documents ── */}
        <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-sm">
          <SectionHeader icon={Shield} title="Compliance Documents (Optional)" subtitle="Speed up verification by uploading these now. JPG, PNG or PDF under 5MB." />
          <div className="space-y-4">
            {([
              { key: "reg" as const, label: "Business Registration Certificate", file: registrationFile, setFile: setRegistrationFile },
              { key: "nic" as const, label: "Owner NIC / ID (Front & Back)", file: ownerNicFile, setFile: setOwnerNicFile },
              { key: "tax" as const, label: "Tax Document (TIN Certificate)", file: taxFile, setFile: setTaxFile },
            ]).map(({ key, label, file, setFile }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${file ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{label}</p>
                    {file && <p className="text-xs text-emerald-600 font-medium truncate max-w-[200px]">{file.name}</p>}
                  </div>
                </div>
                {!isReadOnly && (
                  <label className="cursor-pointer px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors shrink-0 text-center">
                    {file ? "Change File" : "Select File"}
                    <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit Button ── */}
        {!isReadOnly && (
          <div className="sticky bottom-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">Ready to submit?</p>
                <p className="text-xs text-gray-500">Your application will go to admin for review (24–48 hours).</p>
              </div>
              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div key="saved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm">
                    <CheckCircle2 size={16} /> Submitted!
                  </motion.div>
                ) : (
                  <motion.button key="submit" onClick={handleSubmit} disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Save size={16} /> Submit for Approval</>}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
