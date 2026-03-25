"use client";

import { useMemo } from "react";
import { 
  CreditCard, 
  CalendarCheck, 
  Clock, 
  PieChart
} from "lucide-react";

export default function StatCards({ bookings = [] }: { bookings?: any[] }) {
  const stats = useMemo(() => {
    // 1. Total Revenue (Confirmed only)
    const revenue = bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    // 2. Total Bookings
    const totalBookings = bookings.length;

    // 3. Pending Approvals
    const pendingCount = bookings.filter(b => b.status === "pending").length;

    // 4. Completion Rate (Confirmed / (Total - Pending - Cancelled))
    // Simplification: Confirmed / (Confirmed + Rejected)
    const resolvedBookings = bookings.filter(b => ["confirmed", "rejected"].includes(b.status));
    const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
    
    let completionRate = 0;
    if (resolvedBookings.length > 0) {
      completionRate = Math.round((confirmedCount / resolvedBookings.length) * 100);
    } else if (confirmedCount > 0) {
      completionRate = 100; // Edge case
    }

    return [
      { 
        name: "Total Revenue", 
        value: `Rs. ${revenue.toLocaleString()}`, 
        change: "All Time", 
        trend: "neutral", 
        icon: CreditCard, 
        color: "emerald" 
      },
      { 
        name: "Total Bookings", 
        value: totalBookings.toString(), 
        change: pendingCount > 0 ? `${pendingCount} pending` : "Up to date", 
        trend: pendingCount > 0 ? "warning" : "up", 
        icon: CalendarCheck, 
        color: "blue" 
      },
      { 
        name: "Action Required", 
        value: pendingCount.toString(), 
        change: "Needs Approval", 
        trend: pendingCount > 0 ? "down" : "neutral", 
        icon: Clock, 
        color: "amber" 
      },
      { 
        name: "Confirmation Rate", 
        value: `${completionRate}%`, 
        change: "Of processed requests", 
        trend: completionRate >= 80 ? "up" : completionRate >= 50 ? "neutral" : "down", 
        icon: PieChart, 
        color: "purple" 
      },
    ];
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                stat.trend === 'down' ? 'bg-red-50 text-red-600' : 
                stat.trend === 'warning' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-50 text-slate-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
