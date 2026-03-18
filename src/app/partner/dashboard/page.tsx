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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [businessReg, setBusinessReg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      setAuthState(state);

      if (state.authed && state.role === "business") {
        try {
          const { data } = await client.models.BusinessRegistration.list({
            filter: { ownerEmail: { eq: state.email } }
          });
          if (data && data.length > 0) {
            setBusinessReg(data[0]);
          }
        } catch (error) {
          console.error("Error fetching business registration:", error);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authState?.authed || authState.role !== "business") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-500 mb-8">You need to be logged in as a business partner to view this page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Overview</h1>
          <p className="text-gray-500">Track your performance and manage your business operations.</p>
        </div>

        {/* Business Registration Status Card */}
        <BusinessInfoCard businessReg={businessReg} />

        {/* Only show stats and listings if they have an approved business */}
        {businessReg?.status === "business_approved" && (
          <>
            {/* Statistics */}
            <StatCards />

            {/* Listings Section */}
            <ListingGrid />

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { id: 1, type: "order", text: "New booking received for Consultation Session", time: "2 hours ago", icon: "📦" },
                  { id: 2, type: "approval", text: "Your listing 'Equipment Rental' is under review", time: "5 hours ago", icon: "⏳" },
                  { id: 3, type: "system", text: "Welcome to the LesiBooking Partner Platform!", time: "1 day ago", icon: "🎉" },
                ].map((activity) => (
                  <div key={activity.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm font-medium">{activity.text}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
