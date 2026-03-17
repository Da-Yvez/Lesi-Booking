"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";

export default function PartnerHero() {
  const benefits = [
    "Reach thousands of new clients locally",
    "Streamlined booking and scheduling",
    "Automated reminders to reduce no-shows",
    "Detailed analytics and customer insights"
  ];

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold">
            <Zap className="w-4 h-4" /> Powering Local Businesses
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Grow your business with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              LesiBooking
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
            Join the platform that connects top-rated salons, clinics, and specialists with clients actively looking to book.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3 text-slate-600"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Abstract Imagery (Handshake / Connection) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px] rounded-3xl border border-gray-200 bg-gray-50 backdrop-blur-3xl overflow-hidden flex items-center justify-center"
        >
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
          
          <div className="relative flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl" />
            
            {/* Minimalist 3D/Abstract representation of partnership */}
             <div className="relative space-y-8 text-center bg-white/80 p-10 rounded-3xl border border-gray-200 backdrop-blur-md shadow-xl z-10">
               <div className="flex justify-center gap-6">
                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-0.5 shadow-lg shadow-blue-500/20">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                       <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                 </div>
                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-0.5 shadow-lg shadow-purple-500/20 mt-8">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                       <Users className="w-8 h-8 text-purple-400" />
                    </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <h3 className="text-gray-900 font-bold text-xl">Partnership Delivered</h3>
                 <p className="text-slate-500 text-sm">We succeed when you succeed.</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
