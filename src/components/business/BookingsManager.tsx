"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  User, Phone, FileText, X, Loader2, CreditCard, AlertCircle,
  Eye, ChevronDown
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-400" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-300" },
};

// ─── Booking Detail Drawer ────────────────────────────────────────────────────

function BookingDrawer({
  booking,
  onClose,
  onStatusUpdate,
}: {
  booking: any;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [actionLoading, setActionLoading] = useState<"confirm" | "reject" | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (booking?.paymentProofKey) {
      getUrl({ path: booking.paymentProofKey })
        .then(r => setProofUrl(r.url.toString()))
        .catch(() => {});
    }
  }, [booking?.paymentProofKey]);

  const handleAction = async (action: "confirmed" | "rejected") => {
    setActionLoading(action === "confirmed" ? "confirm" : "reject");
    try {
      await client.models.Booking.update({ id: booking.id, status: action });
      onStatusUpdate(booking.id, action);
      onClose();
    } catch (err) {
      console.error("Failed to update booking status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl shadow-slate-900/20 overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Booking Details</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {formatDateDisplay(booking.date)} · {formatTime12(booking.time)}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all hover:rotate-90 duration-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest ${statusCfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </div>

          {/* Schedule Summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</p>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-blue-600 shrink-0" />
              <span className="text-sm font-bold text-slate-900">{formatDateDisplay(booking.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-blue-600 shrink-0" />
              <span className="text-sm font-bold text-slate-900">
                {formatTime12(booking.time)} → {booking.endTime ? formatTime12(booking.endTime) : "—"}
                <span className="text-slate-400 font-medium ml-2">({booking.duration} min)</span>
              </span>
            </div>
          </div>

          {/* Client Info */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Information</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</p>
                <p className="text-sm font-bold text-slate-900">{booking.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</p>
                <p className="text-sm font-bold text-slate-900">+94 {booking.clientMobile}</p>
              </div>
            </div>
            {booking.clientNote && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{booking.clientNote}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          {(booking.price || booking.paymentProofKey) && (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
              {booking.price && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">Amount</span>
                  </div>
                  <span className="text-sm font-black text-blue-600">{booking.price} {booking.currency}</span>
                </div>
              )}
              {proofUrl && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Proof</p>
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                    <Eye size={14} /> View Receipt
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Approve / Reject Actions */}
        {booking.status === "pending" && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex gap-3">
            <button
              onClick={() => handleAction("rejected")}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
            >
              {actionLoading === "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
            <button
              onClick={() => handleAction("confirmed")}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {actionLoading === "confirm" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Approve
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingsManager({ ownerEmail }: { ownerEmail: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch all listings for this business
  useEffect(() => {
    async function fetchListings() {
      try {
        const { data } = await client.models.Listing.list({
          filter: { ownerEmail: { eq: ownerEmail } }
        });
        setListings(data || []);
        if (data && data.length > 0) setSelectedListing(data[0]);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoadingListings(false);
      }
    }
    if (ownerEmail) fetchListings();
  }, [ownerEmail]);

  // Fetch bookings for selected listing
  const fetchBookings = useCallback(async () => {
    if (!selectedListing) return;
    setLoadingBookings(true);
    try {
      const { data } = await client.models.Booking.list({
        filter: { listingId: { eq: selectedListing.id } }
      });
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [selectedListing]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Generate date range: past 7 days + next 14 days
  const dateRange = Array.from({ length: 22 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 7 + i);
    return d;
  });

  // Time slots for selected day
  const daySlots = (() => {
    if (!selectedListing) return [];
    const timeSlots = selectedListing.timeSlots || "09:00-17:00";
    const raw = timeSlots.replace(/"/g, "").trim();
    const parts = raw.split("-");
    const startParts = parts[0]?.split(":") || ["9", "0"];
    const endParts = parts[1]?.split(":") || ["17", "0"];
    const startMins = parseInt(startParts[0] || "9") * 60 + parseInt(startParts[1] || "0");
    const endMins = parseInt(endParts[0] || "17") * 60 + parseInt(endParts[1] || "0");
    const duration = selectedListing.duration || 60;
    const slots = [];
    let m = startMins;
    while (m + duration <= endMins) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      m += duration;
    }
    return slots;
  })();

  // Bookings for selected day
  const dateKey = selectedDate.toISOString().split("T")[0];
  const dayBookings = bookings.filter(b => b.date === dateKey);
  const bookingByTime = Object.fromEntries(dayBookings.map(b => [b.time, b]));

  // Stats
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;

  const handleStatusUpdate = (id: string, status: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  if (loadingListings) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <Calendar size={28} className="text-slate-300" />
        </div>
        <p className="text-slate-900 font-bold">No listings found</p>
        <p className="text-slate-400 text-sm">Create your first listing to start receiving bookings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Listing Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bookings Schedule</h2>
          <p className="text-slate-500 text-sm mt-1">
            <span className="text-blue-600 font-bold">{pendingCount}</span> pending · <span className="text-emerald-600 font-bold">{confirmedCount}</span> confirmed · {totalBookings} total
          </p>
        </div>
        {/* Listing dropdown */}
        <div className="relative">
          <select
            value={selectedListing?.id || ""}
            onChange={e => setSelectedListing(listings.find(l => l.id === e.target.value))}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer shadow-sm"
          >
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Date Navigator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5 h-fit shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2">Date Navigator</p>
          <div className="max-h-[520px] overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {dateRange.map((date, idx) => {
              const key = date.toISOString().split("T")[0];
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const dayBookingCount = bookings.filter(b => b.date === key).length;
              const dayPending = bookings.filter(b => b.date === key && b.status === "pending").length;
              const dayConfirmed = bookings.filter(b => b.date === key && b.status === "confirmed").length;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                    isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" :
                    isToday ? "bg-blue-50 text-blue-900 hover:bg-blue-100" :
                    "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="shrink-0 text-center w-10">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-blue-200" : isToday ? "text-blue-500" : "text-slate-400"}`}>
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className={`text-lg font-black leading-none ${isSelected ? "text-white" : isToday ? "text-blue-600" : "text-slate-900"}`}>
                      {date.getDate()}
                    </p>
                    <p className={`text-[9px] font-bold ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    {dayBookingCount > 0 ? (
                      <div className="space-y-1">
                        {dayPending > 0 && (
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isSelected ? "text-amber-200" : "text-amber-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-300" : "bg-amber-400"}`} />
                            {dayPending} pending
                          </div>
                        )}
                        {dayConfirmed > 0 && (
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isSelected ? "text-emerald-200" : "text-emerald-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-400"}`} />
                            {dayConfirmed} confirmed
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={`text-[10px] font-medium ${isSelected ? "text-blue-200" : "text-slate-300"}`}>No bookings</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Day Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""} · {daySlots.length} total slots</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : daySlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={28} className="text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">No time slots configured for this listing.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {daySlots.map(time => {
                const booking = bookingByTime[time];
                const statusCfg = booking ? (STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending) : null;

                return (
                  <div
                    key={time}
                    onClick={() => booking && setSelectedBooking(booking)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all ${booking ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}`}
                  >
                    {/* Time */}
                    <div className="w-20 shrink-0">
                      <p className="text-sm font-black text-slate-900">{formatTime12(time)}</p>
                      <p className="text-[10px] font-bold text-slate-400">{selectedListing?.duration} min</p>
                    </div>

                    {/* Slot Status */}
                    {booking ? (
                      <div className="flex-1 flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${statusCfg?.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot}`} />
                          {statusCfg?.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{booking.clientName}</p>
                          <p className="text-[11px] text-slate-400 font-medium">+94 {booking.clientMobile}</p>
                        </div>
                        {booking.paymentProofKey && (
                          <div className="shrink-0">
                            <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              <CreditCard size={11} /> Paid
                            </span>
                          </div>
                        )}
                        {booking.status === "pending" && (
                          <div className="shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Tap to review →</div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Available</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Detail Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDrawer
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
