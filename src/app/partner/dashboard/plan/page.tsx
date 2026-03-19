"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import { getAuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter } from "next/navigation";
import { Loader2, Star, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

const client = generateClient<Schema>();

export default function PartnerPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [partnerSub, setPartnerSub] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      if (!state.authed || state.role !== "business") {
        router.replace("/login");
        return;
      }

      try {
        const { data } = await client.models.PartnerSubmission.list({
          filter: { ownerEmail: { eq: state.email } }
        });
        if (data && data.length > 0) {
          const sorted = data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          setPartnerSub(sorted[0]);
        }
      } catch (err) {
        console.error("Failed to load partner submission", err);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
       </div>
     );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Plan</h1>
          <p className="text-gray-500">Manage your LesiBooking subscription and billing.</p>
        </div>

        {partnerSub ? (
          <div className="bg-white border text-gray-900 border-gray-200 shadow-sm rounded-2xl overflow-hidden">
             <div className="p-8 pb-0">
               <div className="flex items-center justify-between mb-6 border-b pb-6">
                 <div>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
                   <h2 className="text-3xl font-bold flex items-center gap-3">
                     {partnerSub.plan === 'monthly' ? 'Monthly Flex' : 'Annual Pro'}
                     {partnerSub.status === 'partner_approved' && (
                       <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                         <CheckCircle2 size={14} /> Active
                       </span>
                     )}
                     {partnerSub.status === 'pending_partner_approval' && (
                       <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1">
                         <Clock size={14} /> Pending Review
                       </span>
                     )}
                     {partnerSub.status === 'rejected' && (
                       <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wider flex items-center gap-1">
                         <AlertTriangle size={14} /> Failed / Rejected
                       </span>
                     )}
                   </h2>
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                   <Star className="text-white w-8 h-8" />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 text-sm">
                 <div>
                   <p className="text-gray-500 mb-1">Billing Amount</p>
                   <p className="font-bold text-lg">{partnerSub.planPrice}</p>
                 </div>
                 <div>
                   <p className="text-gray-500 mb-1">Payment Method</p>
                   <p className="font-semibold uppercase">{partnerSub.paymentMethod || 'Bank Transfer'}</p>
                 </div>
                 <div>
                   <p className="text-gray-500 mb-1">Status Since</p>
                   <p className="font-semibold">{new Date(partnerSub.submittedAt).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-gray-500 mb-1">Features Included</p>
                   <p className="font-semibold text-blue-600 flex items-center gap-1">
                    <ShieldCheck size={16} /> All Premium Features
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
                <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  Need Help with Billing?
                </Link>
             </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-blue-600" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Partner Plan</h2>
             <p className="text-gray-500 max-w-md mx-auto mb-8">
               You need a partner plan to unlock the ability to create listings and operate your business on the platform.
             </p>
             <Link href="/partner/checkout" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm">
               View & Purchase Plans
             </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
