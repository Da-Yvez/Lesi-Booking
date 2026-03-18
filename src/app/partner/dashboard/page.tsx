"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import StatCards from "@/components/business/StatCards";
import BusinessInfoCard from "@/components/business/BusinessInfoCard";
import ListingGrid from "@/components/business/ListingGrid";
import { getAuthState, AuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function BusinessDashboard() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      setAuthState(state);

      if (state.authed && state.role === "business") {
        // Fetch submission for status
        try {
          const { data } = await client.models.PartnerSubmission.list({
            filter: { email: { eq: state.email } }
          });
          if (data && data.length > 0) {
            setSubmission(data[0]);
          }
        } catch (error) {
          console.error("Error fetching submission:", error);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authState?.authed || authState.role !== "business") {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-8">You need to be logged in as a business partner to view this page.</p>
          <a href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Business Overview</h1>
          <p className="text-slate-400">Track your performance and manage your business operations.</p>
        </div>

        {/* Business Info & Status */}
        <BusinessInfoCard 
          businessName={submission?.businessBrandName || submission?.businessLegalName}
          status={submission?.status}
          regNumber={submission?.registrationNumber}
          email={submission?.email}
        />

        {/* Statistics */}
        <StatCards />

        {/* Listings Section */}
        <ListingGrid />

        {/* Recent Activity */}
        <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <button className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-slate-800">
            {[
              { id: 1, type: "order", text: "New booking received for Consultation Session", time: "2 hours ago", icon: "📦" },
              { id: 2, type: "approval", text: "Your listing 'Equipment Rental' is under review", time: "5 hours ago", icon: "⏳" },
              { id: 3, type: "system", text: "Welcome to the LesiBooking Partner Platform!", time: "1 day ago", icon: "🎉" },
            ].map((activity) => (
              <div key={activity.id} className="p-6 flex items-start gap-4 hover:bg-slate-800/20 transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.text}</p>
                  <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
