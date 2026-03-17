"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import { signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import BusinessApprovalTable from "@/components/admin/BusinessApprovalTable";
import ListingApprovalTable from "@/components/admin/ListingApprovalTable";
import PartnerApprovalTable from "@/components/admin/PartnerApprovalTable";
import { Shield, LogOut, Loader2, Building2, ListChecks, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react";

const client = generateClient<Schema>();

type Tab = "business" | "listing" | "partner";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [partnerSubs, setPartnerSubs] = useState<any[]>([]);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setSubmissions(getSubmissions());
    
    // Fetch live partner submissions from Amplify
    try {
      const { data, errors } = await client.models.PartnerSubmission.list({
        authMode: "apiKey"
      });
      if (errors) console.error("Amplify List Errors:", errors);
      
      console.log("Partner Submissions fetched count:", data?.length);
      console.log("Raw Partner Submissions:", data);

      // Sort by newest first
      const sorted = [...(data || [])].sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setPartnerSubs(sorted);
    } catch (err) {
      console.error("Failed to fetch partner submissions:", err);
    }
  }, []);

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

  const handlePartnerApprove = async (id: string) => {
    try {
      await client.models.PartnerSubmission.update({
        id,
        status: "partner_approved"
      });
      refresh();
    } catch (err) {
      console.error("Failed to approve partner:", err);
    }
  };

  const handlePartnerReject = async (id: string) => {
    try {
      await client.models.PartnerSubmission.update({
        id,
        status: "rejected"
      });
      refresh();
    } catch (err) {
      console.error("Failed to reject partner:", err);
    }
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
  const pendingListing = submissions.filter(s => s.status === "pending_listing_approval").length;
  const approved = submissions.filter(s => s.status === "listing_approved").length;
  const rejected = submissions.filter(s => s.status === "rejected").length;
  const pendingPartner = partnerSubs.filter(s => s.status === "pending_partner_approval").length;

  const stats = [
    { label: "Pending Business", val: pendingBusiness, icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", id: "business" },
    { label: "Pending Listing", val: pendingListing, icon: ListChecks, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", id: "listing" },
    { label: "Partner Purchases", val: pendingPartner, icon: CreditCard, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", id: "partner" },
    { label: "Active & Live", val: approved, icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { label: "Rejected", val: rejected, icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
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
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-medium transition-all"
            >
              <Loader2 className="w-3.5 h-3.5" /> Refresh Data
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {tab === "business" ? "Business Approvals" : tab === "listing" ? "Listing Approvals" : "Partner Purchases"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage {tab === "partner" ? "partner purchase requests" : "business applications"}.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map(({ label, val, icon: Icon, color, id }) => (
            <button
              key={label}
              onClick={() => id && setTab(id as Tab)}
              className={`rounded-2xl border p-4 space-y-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${color} ${id ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
                <Icon className="w-4 h-4 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{val}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl w-fit border border-white/10">
          {([
            { id: "business", label: "Business Approvals", icon: Building2, count: pendingBusiness },
            { id: "listing", label: "Listing Approvals", icon: ListChecks, count: pendingListing },
            { id: "partner", label: "Partner Purchases", icon: CreditCard, count: pendingPartner },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id
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
          ) : tab === "listing" ? (
            <ListingApprovalTable
              submissions={submissions}
              onApprove={(id) => handleApprove(id, false)}
              onReject={handleReject}
            />
          ) : (
            <PartnerApprovalTable
              submissions={partnerSubs}
              onApprove={handlePartnerApprove}
              onReject={handlePartnerReject}
            />
          )}
        </div>
      </div>
    </main>
  );
}
