"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/lib/authGuard";
import { signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import BusinessRegistrationTable from "@/components/admin/BusinessRegistrationTable";
import ListingApprovalTable from "@/components/admin/ListingApprovalTable";
import PartnerApprovalTable from "@/components/admin/PartnerApprovalTable";
import { 
  Shield, 
  LogOut, 
  Loader2, 
  ListChecks, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Store, 
  LayoutDashboard,
  RefreshCw,
  Bell
} from "lucide-react";

const client = generateClient<Schema>();

type Tab = "overview" | "bizreg" | "partner" | "listing";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bizreg", label: "Business Regs", icon: Store },
  { id: "partner", label: "Partner Plans", icon: CreditCard },
  { id: "listing", label: "Listing Approvals", icon: ListChecks },
] as const;

export default function AdminDashboardPage() {
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bizRegs, setBizRegs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [partnerSubs, setPartnerSubs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listings, setListings] = useState<any[]>([]);
  
  const router = useRouter();

  const refresh = useCallback(async () => {
    // Fetch business registrations
    try {
      const { data, errors } = await client.models.BusinessRegistration.list({ authMode: "apiKey" });
      if (errors) console.error("Amplify BusinessRegistration Errors:", errors);
      const sorted = [...(data || [])].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setBizRegs(sorted);
    } catch (err) {
      console.error("Failed to fetch business registrations:", err);
    }

    // Fetch partner plan submissions
    try {
      const { data, errors } = await client.models.PartnerSubmission.list({ authMode: "apiKey" });
      if (errors) console.error("Amplify PartnerSubmission Errors:", errors);
      const sorted = [...(data || [])].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setPartnerSubs(sorted);
    } catch (err) {
      console.error("Failed to fetch partner submissions:", err);
    }

    // Fetch listings
    try {
      const { data, errors } = await client.models.Listing.list({ authMode: "apiKey" });
      if (errors) console.error("Amplify Listing Errors:", errors);
      const sorted = [...(data || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setListings(sorted);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
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


  // Approvals & Rejections
  const handleBizRegApprove = async (id: string) => {
    try { await client.models.BusinessRegistration.update({ id, status: "business_approved" }); refresh(); } 
    catch (err) { console.error("Failed to approve business registration:", err); }
  };

  const handleBizRegReject = async (id: string) => {
    try { await client.models.BusinessRegistration.update({ id, status: "rejected" }); refresh(); } 
    catch (err) { console.error("Failed to reject business registration:", err); }
  };

  const handlePartnerApprove = async (id: string) => {
    try { await client.models.PartnerSubmission.update({ id, status: "partner_approved" }); refresh(); } 
    catch (err) { console.error("Failed to approve partner:", err); }
  };

  const handlePartnerReject = async (id: string) => {
    try { await client.models.PartnerSubmission.update({ id, status: "rejected" }); refresh(); } 
    catch (err) { console.error("Failed to reject partner:", err); }
  };

  const handleListingApprove = async (id: string) => {
    try { await client.models.Listing.update({ id, status: "published" }); refresh(); } 
    catch (err) { console.error("Failed to approve listing:", err); }
  };

  const handleListingReject = async (id: string) => {
    try { await client.models.Listing.update({ id, status: "rejected" }); refresh(); } 
    catch (err) { console.error("Failed to reject listing:", err); }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Stats
  const pendingBizReg = bizRegs.filter(r => r.status === "pending_business_approval").length;
  const pendingPartner = partnerSubs.filter(s => s.status === "pending_partner_approval").length;
  const pendingListing = listings.filter(s => s.status === "pending_approval").length;

  const approved = 
    bizRegs.filter(s => s.status === "business_approved").length + 
    partnerSubs.filter(s => s.status === "partner_approved").length + 
    listings.filter(s => s.status === "published").length;

  const rejectedCount = 
    bizRegs.filter(s => s.status === "rejected").length + 
    partnerSubs.filter(s => s.status === "rejected").length + 
    listings.filter(s => s.status === "rejected").length;

  const stats = [
    { label: "Pending Biz Regs", val: pendingBizReg, icon: Store, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", id: "bizreg" },
    { label: "Pending Partner", val: pendingPartner, icon: CreditCard, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", id: "partner" },
    { label: "Pending Listing", val: pendingListing, icon: ListChecks, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", id: "listing" },
    { label: "Total Approved", val: approved, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Total Rejected", val: rejectedCount, icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090f] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0d0d15] flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-none tracking-tight">LesiAdmin</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 focus:outline-none overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
                  {item.label}
                </div>
                {/* Optional count badge for pending items */}
                {item.id === "bizreg" && pendingBizReg > 0 && <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded-md text-indigo-400 font-bold">{pendingBizReg}</span>}
                {item.id === "partner" && pendingPartner > 0 && <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-md text-purple-400 font-bold">{pendingPartner}</span>}
                {item.id === "listing" && pendingListing > 0 && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded-md text-amber-400 font-bold">{pendingListing}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Logged in as</p>
            <p className="text-xs text-slate-300 truncate font-medium">{adminEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-all active:scale-[0.98]"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#09090f]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {SIDEBAR_ITEMS.find(i => i.id === tab)?.label || "Dashboard"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage and monitor the LesiBooking ecosystem
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={refresh}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={16} className="text-indigo-400" />
              Sync Data
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#09090f]"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/10">
              <div className="w-full h-full rounded-[10px] bg-[#09090f] flex items-center justify-center font-bold text-indigo-400 text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500">
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map(({ label, val, icon: Icon, color, id }) => (
                  <div
                    key={label}
                    onClick={() => id && setTab(id as Tab)}
                    className={`group rounded-2xl border p-6 space-y-4 text-left transition-all duration-300 hover:translate-y-[-4px] active:scale-[0.98] ${color} ${id ? "cursor-pointer" : "cursor-default shadow-sm shadow-black/20 focus:outline-none"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-white/10`}>
                         <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-black">{val}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions or charts could go here */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/5 p-8 h-[400px] flex items-center justify-center group hover:bg-white/[0.03] transition-colors border-dashed text-slate-500 text-sm font-medium">
                    <div className="text-center">
                       <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-10" />
                       <p>System Activity Logs & Analytics Coming Soon</p>
                    </div>
                 </div>
                 <div className="rounded-3xl bg-[#0d0d15] border border-white/5 p-8 space-y-6">
                    <h3 className="font-bold text-lg">System Health</h3>
                    <div className="space-y-4">
                       {[
                         { name: "API Gateway", status: "Operational", color: "bg-emerald-500" },
                         { name: "S3 Storage", status: "Operational", color: "bg-emerald-500" },
                         { name: "AppSync", status: "Operational", color: "bg-emerald-500" },
                         { name: "Database", status: "Operational", color: "bg-emerald-500" },
                       ].map(svc => (
                         <div key={svc.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-sm font-semibold text-slate-300">{svc.name}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-slate-500 uppercase">{svc.status}</span>
                               <div className={`w-2 h-2 rounded-full ${svc.color} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {tab === "bizreg" && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <BusinessRegistrationTable
                registrations={bizRegs}
                onApprove={handleBizRegApprove}
                onReject={handleBizRegReject}
              />
            </div>
          )}

          {tab === "partner" && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <PartnerApprovalTable
                submissions={partnerSubs}
                onApprove={handlePartnerApprove}
                onReject={handlePartnerReject}
              />
            </div>
          )}

          {tab === "listing" && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
               <ListingApprovalTable
                listings={listings}
                onApprove={handleListingApprove}
                onReject={handleListingReject}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
