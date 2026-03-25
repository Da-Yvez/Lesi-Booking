"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, X, Clock, Calendar,
  CheckCircle2, AlertCircle, Sparkles, User, Phone,
  FileText, Upload, ImageIcon, ArrowRight, ArrowLeft,
  CreditCard, Loader2
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BookingCalendarProps {
  listing: {
    id: string;
    duration: number;
    workingDays?: string;        // JSON: { mon: true, tue: false, ... }
    timeSlots?: string;          // e.g. "09:00-17:00"
    price: number;
    currency: string;
    title: string;
    bufferTime?: number;
    acceptOnlinePayment?: boolean;
    ownerEmail?: string;
    businessName?: string;
  };
  onClose: () => void;
}

interface TimeSlot {
  time: string;
  label: string;
  occupied: boolean;
  bookingId?: string;
}

interface ClientDetails {
  name: string;
  mobile: string;
  note: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-3 border-b border-slate-100 shrink-0">
      {labels.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                done ? "bg-emerald-500 text-white" :
                active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" :
                "bg-slate-100 text-slate-400"
              }`}>
                {done ? <CheckCircle2 size={14} /> : step}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider mt-1 hidden sm:block ${
                active ? "text-blue-600" : done ? "text-emerald-500" : "text-slate-300"
              }`}>{label}</span>
            </div>
            {i < total - 1 && (
              <div className={`h-px w-8 sm:w-12 mx-1 transition-all duration-500 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingCalendar({ listing, onClose }: BookingCalendarProps) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const hasPayment = !!listing.acceptOnlinePayment;
  const totalSteps = hasPayment ? 3 : 2;
  const stepLabels = hasPayment
    ? ["Schedule", "Details", "Payment"]
    : ["Schedule", "Details"];

  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({ name: "", mobile: "", note: "" });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real occupied slots from DB
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState<Set<string>>(new Set());

  // Parse workingDays
  const workingDays = useMemo<Record<string, boolean>>(() => {
    try {
      return listing.workingDays ? JSON.parse(listing.workingDays) :
        { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false };
    } catch {
      return { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false };
    }
  }, [listing.workingDays]);

  // Parse time range
  const { startHour, startMin, endHour, endMin } = useMemo(() => {
    const raw = (listing.timeSlots || "09:00-17:00").replace(/"/g, "").trim();
    const parts = raw.split("-");
    const startParts = parts[0]?.split(":") || ["9", "0"];
    const endParts = parts[1]?.split(":") || ["17", "0"];
    return {
      startHour: parseInt(startParts[0] || "9", 10),
      startMin: parseInt(startParts[1] || "0", 10),
      endHour: parseInt(endParts[0] || "17", 10),
      endMin: parseInt(endParts[1] || "0", 10),
    };
  }, [listing.timeSlots]);

  // Fetch real occupied slots when date changes
  const fetchOccupiedSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    setOccupiedTimes(new Set());
    try {
      const dateKey = formatDateKey(date);
      const { data } = await client.models.Booking.list({
        filter: {
          listingId: { eq: listing.id },
          date: { eq: dateKey },
          status: { ne: "rejected" }
        }
      });
      const occupied = new Set((data || []).map((b: any) => b.time as string));
      setOccupiedTimes(occupied);
    } catch (err) {
      console.error("Failed to fetch bookings for date", err);
    } finally {
      setLoadingSlots(false);
    }
  }, [listing.id]);

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedSlots(selectedDate);
    }
  }, [selectedDate, fetchOccupiedSlots]);

  // Time slots for selected date (generated from listing open/close hours)
  // Slots step by duration only; buffer is used for conflict detection in DB, not for UI grid spacing
  const timeSlots = useMemo<TimeSlot[]>(() => {
    if (!selectedDate) return [];
    const durationMins = listing.duration || 60;
    const slots: TimeSlot[] = [];
    let mins = startHour * 60 + startMin;
    const endMins = endHour * 60 + endMin;
    while (mins + durationMins <= endMins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const time = `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}`;
      slots.push({ time, label: formatTime12(time), occupied: occupiedTimes.has(time) });
      mins += durationMins;
    }
    return slots;
  }, [selectedDate, startHour, startMin, endHour, endMin, listing.duration, occupiedTimes]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  const isWorkingDay = (date: Date) => !!workingDays[DAY_KEYS[date.getDay()]];
  const isDaySelectable = (date: Date) => date >= today && isWorkingDay(date);

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  const step1Valid = !!selectedDate && !!selectedSlot;
  const step2Valid = clientDetails.name.trim().length >= 2 && clientDetails.mobile.trim().length >= 6;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentProof(file);
    const reader = new FileReader();
    reader.onloadend = () => setPaymentPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      // Double-check: re-query to prevent race condition double-booking
      const dateKey = formatDateKey(selectedDate);
      const { data: existing } = await client.models.Booking.list({
        filter: {
          listingId: { eq: listing.id },
          date: { eq: dateKey },
          time: { eq: selectedSlot },
          status: { ne: "rejected" }
        }
      });
      if (existing && existing.length > 0) {
        setSubmitError("This slot was just taken. Please choose a different time.");
        setSubmitting(false);
        // Refresh slots
        fetchOccupiedSlots(selectedDate);
        return;
      }

      // Upload payment proof if exists
      let paymentProofKey: string | undefined;
      if (paymentProof && hasPayment) {
        const ext = paymentProof.name.split('.').pop();
        paymentProofKey = `payment-proofs/${listing.id}-${dateKey}-${selectedSlot.replace(':','-')}-${Date.now()}.${ext}`;
        await uploadData({
          path: paymentProofKey,
          data: paymentProof,
          options: { contentType: paymentProof.type }
        }).result;
      }

      const endTime = addMinutes(selectedSlot, listing.duration || 60);

      await client.models.Booking.create({
        listingId: listing.id,
        listingTitle: listing.title,
        ownerEmail: listing.ownerEmail || "",
        businessName: listing.businessName || "",
        date: dateKey,
        time: selectedSlot,
        endTime,
        duration: listing.duration,
        clientName: clientDetails.name,
        clientMobile: clientDetails.mobile,
        clientNote: clientDetails.note || undefined,
        price: listing.price,
        currency: listing.currency,
        paymentProofKey: paymentProofKey || undefined,
        status: "pending",
      });

      setConfirmed(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };
  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goPrev = () => { setDirection(-1); setStep(s => s - 1); };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto w-full md:max-w-5xl md:mx-4 bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[94vh] md:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-none tracking-tight">Book Appointment</h2>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest line-clamp-1">{listing.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all hover:rotate-90 duration-300"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step Indicator */}
          {!confirmed && <StepIndicator current={step} total={totalSteps} labels={stepLabels} />}

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {confirmed ? (
              <ConfirmedView
                date={formattedDate!}
                time={selectedSlot!}
                listing={listing}
                clientName={clientDetails.name}
                onClose={onClose}
              />
            ) : (
              <AnimatePresence mode="wait" custom={direction}>
                {/* ── Step 1: Date & Time ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                    className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100"
                  >
                    {/* Calendar */}
                    <div className="flex-1 p-6 min-w-0">
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                          disabled={currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                          onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 mb-2">
                        {DAY_NAMES.map(d => (
                          <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-y-1.5">
                        {calendarDays.map((date, idx) => {
                          if (!date) return <div key={`e-${idx}`} />;
                          const key = formatDateKey(date);
                          const isToday = key === formatDateKey(today);
                          const selectable = isDaySelectable(date);
                          const isSelected = selectedDate && key === formatDateKey(selectedDate);
                          return (
                            <button
                              key={key}
                              onClick={() => { if (selectable) { setSelectedDate(date); setSelectedSlot(null); } }}
                              disabled={!selectable}
                              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 mx-0.5
                                ${isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                                : isToday && selectable ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                : selectable ? "hover:bg-slate-100 text-slate-900"
                                : "text-slate-200 cursor-not-allowed"}`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Unavailable Day</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600" /> Selected</span>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1 min-w-0">
                      <AnimatePresence mode="wait">
                        {!selectedDate ? (
                          <motion.div key="no-date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                              <Calendar size={28} className="text-slate-200" />
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-1">Pick a date first</p>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                              Select a working day from the calendar to see open slots.
                            </p>
                          </motion.div>
                        ) : loadingSlots ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                            <p className="text-xs font-bold text-slate-400">Checking availability...</p>
                          </motion.div>
                        ) : (
                          <motion.div key="slots" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="p-6 space-y-5">
                            <div>
                              <h4 className="text-base font-black text-slate-900 tracking-tight">{formattedDate}</h4>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock size={11} /> {listing.duration}min slots
                                </span>
                                {occupiedTimes.size > 0 && (
                                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                    <AlertCircle size={11} /> {occupiedTimes.size} booked
                                  </span>
                                )}
                                {timeSlots.length === 0 && (
                                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">No slots available</span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {timeSlots.map(slot => {
                                const isSel = selectedSlot === slot.time;
                                return (
                                  <motion.button key={slot.time}
                                    whileHover={!slot.occupied ? { scale: 1.04 } : {}}
                                    whileTap={!slot.occupied ? { scale: 0.97 } : {}}
                                    onClick={() => !slot.occupied && setSelectedSlot(isSel ? null : slot.time)}
                                    disabled={slot.occupied}
                                    className={`relative py-3 px-2 rounded-2xl text-center transition-all duration-200 border text-xs font-bold
                                      ${slot.occupied ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                      : isSel ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50"}`}
                                  >
                                    {slot.occupied && <span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-px bg-slate-200 absolute rotate-[-10deg]" /></span>}
                                    <span className={slot.occupied ? "opacity-40" : ""}>{slot.label}</span>
                                    {slot.occupied && <span className="block text-[9px] font-black uppercase tracking-widest text-slate-300 mt-0.5">Booked</span>}
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Proceed CTA */}
                            {selectedSlot && (
                              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                className="pt-2">
                                <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4 mb-4 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</p>
                                    <p className="text-sm font-black text-slate-900">{formatTime12(selectedSlot)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                    <p className="text-sm font-black text-slate-900">{listing.duration} min</p>
                                  </div>
                                </div>
                                <button
                                  onClick={goNext}
                                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                  Continue to Details <ArrowRight size={15} />
                                </button>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Client Details ── */}
                {step === 2 && (
                  <motion.div key="step2" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                    className="p-6 md:p-8 max-w-xl mx-auto w-full space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Details</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">We need a few details to confirm your booking.</p>
                    </div>

                    {/* Booking mini-summary bar */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Your Appointment</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{formattedDate} · {formatTime12(selectedSlot!)}</p>
                      </div>
                      <span className="text-sm font-black text-blue-600 shrink-0">{listing.price} {listing.currency}</span>
                    </div>

                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        {submitError}
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <User size={11} /> Full Name *
                        </label>
                        <input
                          type="text"
                          value={clientDetails.name}
                          onChange={e => setClientDetails(c => ({ ...c, name: e.target.value }))}
                          placeholder="e.g. Navindra Perera"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Phone size={11} /> Mobile Number *
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 shrink-0">
                            🇱🇰 +94
                          </div>
                          <input
                            type="tel"
                            value={clientDetails.mobile}
                            onChange={e => setClientDetails(c => ({ ...c, mobile: e.target.value.replace(/\D/g, "") }))}
                            placeholder="07X XXX XXXX"
                            maxLength={10}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <FileText size={11} /> Note <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={clientDetails.note}
                          onChange={e => setClientDetails(c => ({ ...c, note: e.target.value }))}
                          placeholder="Any special requests, health conditions or details the provider should know..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white resize-none"
                        />
                      </div>

                      {/* Pending approval notice */}
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 font-medium">
                          <span className="font-black block mb-0.5">Pending Business Approval</span>
                          Your booking request will be reviewed and confirmed by the business within 24 hours.
                        </div>
                      </div>
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={goPrev}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        onClick={() => { if (hasPayment) { goNext(); } else { handleConfirm(); } }}
                        disabled={!step2Valid || submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg disabled:shadow-none hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
                      >
                        {submitting ? (
                          <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                        ) : hasPayment ? (
                          <>Continue to Payment <ArrowRight size={14} /></>
                        ) : (
                          <>Send Booking Request <CheckCircle2 size={14} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Payment Proof (conditional) ── */}
                {step === 3 && hasPayment && (
                  <motion.div key="step3" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                    className="p-6 md:p-8 max-w-xl mx-auto w-full space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Upload Payment Proof</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        This business requires a payment slip to confirm your booking.
                      </p>
                    </div>

                    {/* Amount due */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Amount Due</p>
                        <p className="text-2xl font-black tracking-tight">{listing.price} <span className="text-base text-blue-200">{listing.currency}</span></p>
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        {submitError}
                      </div>
                    )}

                    {/* Upload area */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Upload size={11} /> Payment Receipt *
                      </label>
                      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden"
                        onChange={handleFileChange}
                      />
                      {paymentPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-300 bg-slate-50 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={paymentPreview} alt="Payment proof" className="w-full max-h-48 object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <button
                              onClick={() => { setPaymentProof(null); setPaymentPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                              className="opacity-0 group-hover:opacity-100 transition-all bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl"
                            >
                              Change File
                            </button>
                          </div>
                          <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
                            <ImageIcon size={14} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-700 truncate">{paymentProof?.name}</span>
                            <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                              {paymentProof ? (paymentProof.size / 1024).toFixed(0) + " KB" : ""}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group hover:bg-blue-50/30"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Upload size={22} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-700">Click to upload receipt</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">PNG, JPG or PDF · Max 5 MB</p>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={goPrev}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        onClick={handleConfirm}
                        disabled={!paymentProof || submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg disabled:shadow-none hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
                      >
                        {submitting ? (
                          <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                        ) : (
                          <>Submit Booking Request <CheckCircle2 size={14} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

function ConfirmedView({ date, time, listing, clientName, onClose }: {
  date: string; time: string;
  listing: BookingCalendarProps["listing"];
  clientName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center py-14 px-8 space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
      >
        <CheckCircle2 size={40} className="text-white" />
      </motion.div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Booking Request Sent!</span>
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">You&apos;re all set, {clientName.split(" ")[0]}!</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
          Your request for <span className="text-slate-900 font-bold">{listing.title}</span> is being reviewed. The business will confirm you shortly — usually within a few hours.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 w-full max-w-sm text-left">
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">What happens next?</p>
        <p className="text-xs text-amber-700 font-medium">The business will review and approve your booking. You&apos;ll be notified once it&apos;s confirmed.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-sm border border-slate-100 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">Date</span>
          <span className="font-bold text-slate-900 text-right max-w-[60%]">{date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">Time</span>
          <span className="font-bold text-slate-900">{formatTime12(time)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">Duration</span>
          <span className="font-bold text-slate-900">{listing.duration} min</span>
        </div>
        {listing.acceptOnlinePayment && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Payment Proof</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={13} /> Uploaded</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
          <span className="font-black text-slate-900">Status</span>
          <span className="font-black text-amber-500">⏳ Pending Approval</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={onClose}
          className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
          Back to Service
        </button>
      </div>
    </motion.div>
  );
}
