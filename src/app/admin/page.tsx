"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import { signOut } from "aws-amplify/auth";
import BusinessApprovalTable from "@/components/admin/BusinessApprovalTable";
import ListingApprovalTable from "@/components/admin/ListingApprovalTable";
import { Shield, LogOut, Loader2, Building2, ListChecks, Clock, CheckCircle2, XCircle } from "lucide-react";

type Tab = "business" | "listing";

interface Submission {
  id: string;
  submittedAt: string;
  status: string;
  ownerName: string;
  ownerTitle: string;
  ownerPhone: string;
  ownerEmail: string;
  businessName: string;
  category: string;
  description: string;
  website: string;
  outlets: { name: string; address: string; city: string; type: string; hours: string }[];
}

function getSubmissions(): Submission[] {
  try { return JSON.parse(localStorage.getItem("lesi_submissions") || "[]"); }
  catch { return []; }
}

function saveSubmissions(subs: Submission[]) {
  localStorage.setItem("lesi_submissions", JSON.stringify(subs));
}

export default function AdminDashboardPage() {
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [tab, setTab] = useState<Tab>("business");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const router = useRouter();

  const refresh = useCallback(() => setSubmissions(getSubmissions()), []);

  useEffect(() => {
    getAuthState().then((state) => {
      if (!state.authed || state.role !== "admin") {
        router.replace("/admin/login");
      } else {
        setAdminEmail(state.email);
        setChecking(false);
        refresh();
      }
    });
  }, [router, refresh]);

  const handleApprove = (id: string, isBusinessStage: boolean) => {
    const updated = getSubmissions().map(s =>
      s.id === id
        ? { ...s, status: isBusinessStage ? "pending_listing_approval" : "listing_approved" }
        : s
    );
    saveSubmissions(updated);
    refresh();
  };

  const handleReject = (id: string) => {
    const updated = getSubmissions().map(s => s.id === id ? { ...s, status: "rejected" } : s);
    saveSubmissions(updated);
    refresh();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0007] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  // Stats
  const pendingBusiness = submissions.filter(s => s.status === "pending_business_approval").length;
  const pendingListing  = submissions.filter(s => s.status === "pending_listing_approval").length;
  const approved        = submissions.filter(s => s.status === "listing_approved").length;
  const rejected        = submissions.filter(s => s.status === "rejected").length;

  const stats = [
    { label: "Pending Business", val: pendingBusiness, icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { label: "Pending Listing",  val: pendingListing,  icon: ListChecks, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Active & Live",    val: approved,        icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { label: "Rejected",         val: rejected,        icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ];

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0d0d18]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-700/30 border border-red-700/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">LesiBooking Admin</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Business Approvals</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage business partner applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, val, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border p-4 space-y-2 ${color}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
                <Icon className="w-4 h-4 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl w-fit border border-white/10">
          {([
            { id: "business", label: "Business Approvals", icon: Building2, count: pendingBusiness },
            { id: "listing",  label: "Listing Approvals",  icon: ListChecks, count: pendingListing  },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-white text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? "bg-black/10" : "bg-white/10"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div>
          {tab === "business" ? (
            <BusinessApprovalTable
              submissions={submissions}
              onApprove={(id) => handleApprove(id, true)}
              onReject={handleReject}
            />
          ) : (
            <ListingApprovalTable
              submissions={submissions}
              onApprove={(id) => handleApprove(id, false)}
              onReject={handleReject}
            />
          )}
        </div>
      </div>
    </main>
  );
}
