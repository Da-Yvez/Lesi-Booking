"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../amplify/data/resource";
import { Calendar as CalendarIcon, Trash2, Plus, Info } from "lucide-react";

const client = generateClient<Schema>();

interface HolidayManagerProps {
  ownerEmail: string;
}

export default function HolidayManager({ ownerEmail }: HolidayManagerProps) {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHolidays = async () => {
    try {
      const { data } = await client.models.BusinessHoliday.list({
        filter: { ownerEmail: { eq: ownerEmail } }
      });
      // Sort by date ascending
      const sorted = (data || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setHolidays(sorted);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [ownerEmail]);

  const addHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    
    setSubmitting(true);
    try {
      await client.models.BusinessHoliday.create({
        ownerEmail,
        date: newDate,
        note: newNote
      });
      setNewDate("");
      setNewNote("");
      await fetchHolidays();
    } catch (err) {
      console.error("Failed to add holiday", err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await client.models.BusinessHoliday.delete({ id });
      await fetchHolidays();
    } catch (err) {
      console.error("Failed to delete holiday", err);
    }
  };

  const isFuture = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(dateStr) >= today;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <CalendarIcon className="text-blue-600" size={24} />
          Holiday & Off-Day Manager
        </h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">Mark specific days as holidays to block all client bookings.</p>
      </div>

      <div className="p-8 space-y-8 flex-1 flex flex-col md:flex-row gap-12">
        {/* Form Column */}
        <div className="md:w-1/3 space-y-6">
          <form onSubmit={addHoliday} className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Add Off-Day</h4>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">Select Date</label>
              <input 
                type="date" 
                required
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">Optional Note</label>
              <input 
                type="text" 
                placeholder="e.g. New Year, Personal Day"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting || !newDate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Saving...' : <><Plus size={14} /> Add Holiday</>}
            </button>
          </form>

          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
             <Info className="text-blue-600 shrink-0" size={18} />
             <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Holidays apply to <strong>all</strong> your services. Clients will see these dates as "Fully Booked" or "Closed" in the calendar.
             </p>
          </div>
        </div>

        {/* List Column */}
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
           <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
             Upcoming Off-Days
             <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{holidays.filter(h => isFuture(h.date)).length} dates</span>
           </h4>
           
           {loading ? (
             <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />)}
             </div>
           ) : holidays.length === 0 ? (
             <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 italic">No holidays marked yet. Your schedule is fully open.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {holidays.map((h) => (
                 <div key={h.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${isFuture(h.date) ? 'bg-white border-gray-100 hover:border-blue-200' : 'bg-gray-50 border-transparent opacity-60'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isFuture(h.date) ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                          {new Date(h.date).getDate()}
                       </div>
                       <div>
                          <p className={`text-sm font-bold ${isFuture(h.date) ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                            {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {h.note && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{h.note}</p>}
                       </div>
                    </div>
                    <button 
                      onClick={() => deleteHoliday(h.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove off-day"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
