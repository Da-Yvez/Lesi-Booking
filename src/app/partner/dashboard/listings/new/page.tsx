"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import ListingForm from "@/components/business/ListingForm";
import { getAuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../../amplify/data/resource";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const client = generateClient<Schema>();

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [businessReg, setBusinessReg] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      if (!state.authed || state.role !== "business") {
        router.replace("/login");
        return;
      }

      try {
         // Fetch business details to link listing
         const { data: bData } = await client.models.BusinessRegistration.list({
           filter: { ownerEmail: { eq: state.email } }
         });
         
         if (bData && bData.length > 0) {
           setBusinessReg(bData[0]);
           setOwnerEmail(state.email);
         } else {
           router.replace("/partner/dashboard");
         }
      } catch (err) {
        console.error("Failed to load business registration", err);
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
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Listing</h1>
        <ListingForm 
           ownerEmail={ownerEmail} 
           businessRegId={businessReg?.id} 
           businessName={businessReg?.businessBrandName || businessReg?.businessLegalName || "My Business"} 
        />
      </div>
    </DashboardLayout>
  );
}
