export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 blur-[120px] pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full delay-700 animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
          Next-Gen Appointment Planning
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter gradient-text leading-[1.1]">
          Master Your Schedule <br /> with Professional Elegance.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate booking platform for businesses that value time and aesthetics. 
          Manage appointments, clients, and services in one stunning workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95">
            Start Free Trial
          </button>
          <button className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all border border-white/10">
            Watch Demo
          </button>
        </div>
        
        <div className="pt-12 flex items-center justify-center gap-8 text-slate-500 grayscale opacity-50">
          <span className="font-bold tracking-tighter text-xl">TRUSTED BY 100+ TEAMS</span>
        </div>
      </div>
    </section>
  );
}
