"use client";

import { Warp } from "@paper-design/shaders-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center bg-black">
      {/* Warp Shader Background */}
      <div className="absolute inset-0 z-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={0.5}
          colors={["hsl(220, 100%, 10%)", "hsl(210, 100%, 30%)", "hsl(250, 90%, 20%)", "hsl(200, 100%, 40%)"]}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
          Next-Gen Appointment Planning
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] drop-shadow-2xl">
          Master Your Schedule <br /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            with Professional Elegance.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          The ultimate booking platform for businesses that value time and aesthetics. 
          Manage appointments, clients, and services in one stunning workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95">
            Start Free Trial
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all border border-white/10 shadow-lg">
            Watch Demo
          </button>
        </div>
        
        <div className="pt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
          <span className="font-bold tracking-tighter text-xl">TRUSTED BY 100+ TEAMS</span>
        </div>
      </div>
    </section>
  );
}

