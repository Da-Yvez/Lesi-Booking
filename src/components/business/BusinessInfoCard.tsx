"use client";

import { CheckCircle2, AlertCircle, Info, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BusinessInfoCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  businessReg?: any; // BusinessRegistration record or null
}

export default function BusinessInfoCard({ businessReg }: BusinessInfoCardProps) {
  // ── No registration at all ──────────────────────────────────────────────────
  if (!businessReg) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Register Your Business</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven&apos;t submitted a business registration yet. Complete your business info to get approved and start listing your services.
          </p>
        </div>
        <Link
          href="/partner/dashboard/info"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          Fill Out Business Info <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // ── Derive display values ───────────────────────────────────────────────────
  const status = businessReg.status ?? "draft";
  const businessName = businessReg.businessBrandName || businessReg.businessLegalName || "Your Business";
  const regNumber = businessReg.registrationNumber || "N/A";
  const email = businessReg.email || "N/A";
  const ownerName = businessReg.fullName || "N/A";
  const ownerRole = businessReg.ownerRole || "N/A";
  const nicNumber = businessReg.nicNumber || "N/A";
  const category = businessReg.category || "N/A";
  const city = businessReg.city || "N/A";

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "business_approved": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "rejected": return "bg-red-50 text-red-600 border-red-200";
      case "pending_business_approval": return "bg-amber-50 text-amber-600 border-amber-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "business_approved": return "Approved";
      case "rejected": return "Rejected";
      case "pending_business_approval": return "Pending Approval";
      default: return "Draft";
    }
  };

  const StatusIcon = status === "business_approved" ? CheckCircle2 : status === "rejected" ? AlertCircle : Info;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <span className="text-3xl font-bold">{businessName[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{businessName}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <span className="font-medium">Reg:</span> {regNumber}
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="font-medium">Email:</span> {email}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getStatusStyle(status)}`}>
          <StatusIcon size={18} />
          <span className="text-sm font-semibold">{getStatusLabel(status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
        <div>
          <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Owner Details</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Name:</span> {ownerName}</p>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Role:</span> {ownerRole}</p>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">NIC:</span> {nicNumber}</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Business</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Category:</span> {category}</p>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Location:</span> {city}</p>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Structure:</span> {businessReg.legalStructure || "N/A"}</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Actions</h4>
          <div className="space-y-2">
            {(status === "draft" || status === "rejected") && (
              <Link href="/partner/dashboard/info"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all">
                {status === "rejected" ? "Re-submit Info" : "Complete Registration"} <ArrowRight size={14} />
              </Link>
            )}
            {status === "business_approved" && (
              <Link href="/partner/checkout"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all">
                Buy Partner Plan <ArrowRight size={14} />
              </Link>
            )}
            {status === "pending_business_approval" && (
              <Link href="/partner/dashboard/info"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all">
                View Submission <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Info message based on status */}
      {status === "pending_business_approval" && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
          <Info className="text-amber-500 mt-1 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Review in Progress</h4>
            <p className="text-sm text-gray-600">
              Our team is reviewing your business registration. This usually takes 24–48 hours. You&apos;ll be able to purchase a Partner Plan once approved.
            </p>
          </div>
        </div>
      )}
      {status === "rejected" && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4">
          <AlertCircle className="text-red-500 mt-1 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Registration Rejected</h4>
            <p className="text-sm text-gray-600">
              Your business registration was not approved. Please update your information and re-submit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
