"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/business/DashboardLayout";
import StatCards from "@/components/business/StatCards";
import BusinessInfoCard from "@/components/business/BusinessInfoCard";
import StorefrontCard from "@/components/business/StorefrontCard";
import ListingGrid from "@/components/business/ListingGrid";
import TodaysAgenda from "@/components/business/TodaysAgenda";
import HolidayManager from "@/components/business/HolidayManager";
import { getAuthState, AuthState } from "@/lib/authGuard";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function BusinessDashboard() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [businessReg, setBusinessReg] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [partnerSub, setPartnerSub] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async (email: string) => {
    try {
      const { data: bData } = await client.models.BusinessRegistration.list({
        filter: { ownerEmail: { eq: email } }
      });
      if (bData && bData.length > 0) {
        setBusinessReg(bData[0]);
      }

      const { data: pData } = await client.models.PartnerSubmission.list({
        filter: { ownerEmail: { eq: email } }
      });
      if (pData && pData.length > 0) {
         const sorted = pData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
         setPartnerSub(sorted[0]);
      }

      const { data: bookingData } = await client.models.Booking.list({
        filter: { ownerEmail: { eq: email } }
      });
      setBookings(bookingData || []);

    } catch (error) {
      console.error("Error", error);
    }
  };

  useEffect(() => {
    async function init() {
      const state = await getAuthState();
      setAuthState(state);
      if (state.authed && state.role === "business") {
        await fetchDetails(state.email);
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

        {/* Storefront Link Card */}
        {businessReg?.status === "business_approved" && partnerSub?.status === "partner_approved" && (
          <StorefrontCard 
            businessReg={businessReg} 
            onUpdate={() => authState.email && fetchDetails(authState.email)} 
          />
        )}


        {/* Only show stats and listings if they have an approved business */}
        {businessReg?.status === "business_approved" && (
          <>
            {/* Statistics */}
            <StatCards bookings={bookings} />

            {/* Current Partner Plan Info */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-6">
               <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Plan</h3>
               {partnerSub ? (
                 <div className="flex items-center gap-4">
                   <div className={`px-3 py-1 text-sm font-bold rounded-full ${
                     partnerSub.status === 'partner_approved' ? 'bg-green-100 text-green-700' :
                     partnerSub.status === 'pending_partner_approval' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {partnerSub.status === 'partner_approved' ? 'Active' : partnerSub.status === 'pending_partner_approval' ? 'Pending Approval' : 'Rejected'}
                   </div>
                   <p className="text-gray-600">Plan: <span className="font-semibold text-gray-900">{partnerSub.plan === 'monthly' ? 'Monthly Flex' : 'Annual Pro'}</span></p>
                 </div>
               ) : (
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-orange-50 border border-orange-200 p-4 rounded-xl">
                   <div className="flex-1">
                     <p className="text-orange-800 font-semibold mb-1">No Active Partner Plan</p>
                     <p className="text-orange-700 text-sm">You must purchase a partner plan before you can create listings on the platform.</p>
                   </div>
                   <a href="/partner/checkout" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm shrink-0 transition-colors">
                     View Partner Plans
                   </a>
                 </div>
               )}
            </div>

            {/* Holiday Management */}
            <HolidayManager ownerEmail={authState.email} />

            {/* Layout: TodaysAgenda vs Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TodaysAgenda bookings={bookings} />
              
              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">View All</button>
                </div>
                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
                  {[
                    { id: 1, type: "order", text: "New booking received for Consultation Session", time: "2 hours ago", icon: "📦" },
                    { id: 2, type: "approval", text: "Your listing 'Equipment Rental' is under review", time: "5 hours ago", icon: "⏳" },
                    { id: 3, type: "system", text: "Welcome to the LesiBooking Partner Platform!", time: "1 day ago", icon: "🎉" },
                  ].map((activity) => (
                    <div key={activity.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-all">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
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
            </div>

            {/* Listings Section */}
            <ListingGrid partnerSub={partnerSub} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
