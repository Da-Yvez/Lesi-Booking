"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import ListingGrid from "@/components/business/ListingGrid";
import { getAuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const client = generateClient<Schema>();

export default function ListingsPage() {
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
      <div className="max-w-7xl mx-auto space-y-6">
        <ListingGrid partnerSub={partnerSub} />
      </div>
    </DashboardLayout>
  );
}
