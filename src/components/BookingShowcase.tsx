"use client";

import { 
  Building2, 
  Search, 
  CalendarCheck2, 
  Zap, 
  ArrowRight,
  Target,
  Sparkles
} from "lucide-react";

export default function BookingShowcase() {
  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            The Ecosystem
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Bridging the gap between <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Business & Customer</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A seamless cycle designed to help businesses grow and customers find exactly what they need, exactly when they need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent -translate-y-1/2 z-0"></div>

          {/* Phase 1: Business */}
          <div className="group relative z-10">
            <div className="bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Building2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Set Up in Minutes</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                List your services, set your working hours, and customize your profile to attract the right clients.
              </p>
              <div className="mt-auto flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                Partner Portal <ArrowRight size={16} />
              </div>
            </div>
            {/* Phase Tag */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Phase 01</div>
          </div>

          {/* Phase 2: Platform */}
          <div className="group relative z-10">
            <div className="bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-10 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Target size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Discovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Our AI-driven search engine matches your business with customers looking for your exact expertise.
              </p>
              <div className="mt-auto flex items-center gap-2 text-cyan-500 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                Search Engine <ArrowRight size={16} />
              </div>
            </div>
            {/* Phase Tag */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Phase 02</div>
          </div>

          {/* Phase 3: Customer */}
          <div className="group relative z-10">
            <div className="bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-10 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform duration-500">
                <CalendarCheck2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Booking</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Customers book their preferred slots in seconds. Automated reminders ensure they never miss a visit.
              </p>
              <div className="mt-auto flex items-center gap-2 text-indigo-500 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                Client App <ArrowRight size={16} />
              </div>
            </div>
            {/* Phase Tag */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Phase 03</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Real-time Sync", icon: Zap },
            { label: "24/7 Availability", icon: CalendarCheck2 },
            { label: "Global Search", icon: Search },
            { label: "Business Tools", icon: Building2 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-default">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <item.icon size={20} />
              </div>
              <span className="text-sm font-bold text-slate-500 group-hover:text-white transition-all">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
