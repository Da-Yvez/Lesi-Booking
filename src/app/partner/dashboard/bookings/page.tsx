"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import BookingsManager from "@/components/business/BookingsManager";
import { getAuthState } from "@/lib/authGuard";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BookingsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState("");

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      if (!state.authed || state.role !== "business") {
        router.replace("/login");
        return;
      }
      setOwnerEmail(state.email);
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
        <BookingsManager ownerEmail={ownerEmail} />
      </div>
    </DashboardLayout>
  );
}
