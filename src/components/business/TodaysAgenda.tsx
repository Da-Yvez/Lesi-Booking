"use client";

import { useMemo } from "react";
import { Clock, CalendarX2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TodaysAgenda({ bookings = [] }: { bookings?: any[] }) {
  const { todayStr, displayDate } = useMemo(() => {
    const d = new Date();
    // yyyy-MM-dd
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    // EEEE, MMMM do (e.g., "Monday, October 12th")
    const display = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
    
    return { todayStr: `${yyyy}-${mm}-${dd}`, displayDate: display };
  }, []);

  const todaysBookings = useMemo(() => {
    return bookings
      .filter(b => b.date === todayStr)
      .sort((a, b) => {
        // Sort ascending by start time "HH:mm"
        const timeA = a.time.replace(":", "");
        const timeB = b.time.replace(":", "");
        return Number(timeA) - Number(timeB);
      });
  }, [bookings, todayStr]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Today&apos;s Agenda</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{displayDate}</p>
        </div>
        <Link href="/partner/dashboard/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          Manage
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] p-6">
        {todaysBookings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <CalendarX2 className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Schedule Clear</p>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">You don&apos;t have any appointments scheduled for today.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {todaysBookings.map((booking, idx) => {
              const statusColors = {
                confirmed: "bg-emerald-500 border-emerald-200 shadow-emerald-500/20",
                pending: "bg-amber-500 border-amber-200 shadow-amber-500/20",
                cancelled: "bg-slate-400 border-slate-200 shadow-slate-400/20",
                rejected: "bg-red-500 border-red-200 shadow-red-500/20",
              };

              const statusData = {
                confirmed: { icon: CheckCircle2, label: "Confirmed", text: "text-emerald-700", bg: "bg-emerald-50" },
                pending: { icon: AlertCircle, label: "Requires Approval", text: "text-amber-700", bg: "bg-amber-50" },
                cancelled: { icon: Clock, label: "Cancelled", text: "text-slate-700", bg: "bg-slate-50" },
                rejected: { icon: RefreshCw, label: "Rejected", text: "text-red-700", bg: "bg-red-50" },
              };

              const currentStatus = booking.status as keyof typeof statusColors || "pending";
              const SInfo = statusData[currentStatus];
              const SIcon = SInfo.icon;

              return (
                <div key={booking.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Dot */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${statusColors[currentStatus]}`}>
                    <SIcon className="text-white w-4 h-4" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        {booking.time} - {booking.endTime}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SInfo.bg} ${SInfo.text}`}>
                        {SInfo.label}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{booking.listingTitle || "Service Booking"}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="truncate">{booking.clientName}</span>
                      <span>•</span>
                      <span>{booking.clientMobile}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
