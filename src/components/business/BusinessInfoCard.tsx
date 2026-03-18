"use client";

import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface BusinessInfoCardProps {
  businessName?: string;
  status?: string;
  regNumber?: string;
  email?: string;
}

export default function BusinessInfoCard({ 
  businessName = "Your Business", 
  status = "pending_partner_approval", 
  regNumber = "REG-123456", 
  email = "contact@business.com" 
}: BusinessInfoCardProps) {
  
  const getStatusColor = (s: string) => {
    switch (s) {
      case "partner_approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "partner_approved": return "Approved";
      case "rejected": return "Action Required";
      default: return "Pending Approval";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "partner_approved": return CheckCircle2;
      case "rejected": return AlertCircle;
      default: return Info;
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20">
            <span className="text-3xl font-bold">{businessName[0]}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{businessName}</h3>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="font-medium">Reg:</span> {regNumber}
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="font-medium">Email:</span> {email}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getStatusColor(status)}`}>
          <StatusIcon size={18} />
          <span className="text-sm font-semibold">{getStatusLabel(status)}</span>
        </div>
      </div>

      {status === 'pending_partner_approval' && (
        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-4">
          <Info className="text-blue-500 mt-1" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Approval in Progress</h4>
            <p className="text-sm text-slate-400">
              Our team is currently reviewing your business information. This usually takes 24-48 hours. 
              You can still set up your listings and services in the meantime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
