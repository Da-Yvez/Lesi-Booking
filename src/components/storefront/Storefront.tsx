"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Star, Clock, Calendar, ChevronRight, CheckCircle2, ShieldCheck, Mail, Globe, Instagram, Facebook } from "lucide-react";
import { getUrl } from "aws-amplify/storage";
import { motion } from "framer-motion";

export default function Storefront({ business, listings }: { business: any, listings: any[] }) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchImages() {
      const urls: Record<string, string> = {};
      for (const listing of listings) {
        if (listing.coverImageKey) {
          try {
            const res = await getUrl({ path: listing.coverImageKey });
            urls[listing.id] = res.url.toString();
          } catch (e) {
            console.error(e);
          }
        }
      }
      setImageUrls(urls);
    }
    fetchImages();
  }, [listings]);

  // Generate a predictable gradient based on business name
  const gradientIndex = business.businessBrandName.length % 5;
  const gradients = [
    "from-blue-600 to-indigo-900",
    "from-emerald-600 to-teal-900",
    "from-rose-600 to-pink-900",
    "from-amber-500 to-orange-800",
    "from-violet-600 to-purple-900"
  ];
  const headerGradient = gradients[gradientIndex];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Dynamic Header Banner */}
      <div className={`h-64 md:h-80 w-full bg-gradient-to-br ${headerGradient} relative overflow-hidden flex items-center justify-center`}>
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl"></div>
        
        {/* Brand Name prominent in header */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white/90 tracking-tighter mix-blend-overlay text-center px-4 leading-none">
          {business.businessBrandName.toUpperCase()}
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-24">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-900/5 border border-slate-100 p-6 md:p-10 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left: Avatar & Intro */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {business.category}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                  <ShieldCheck size={12} /> Verified Partner
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {business.businessBrandName}
              </h1>
              
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                {business.shortDescription || "Welcome to our booking page. Browse our services below and book an appointment instantly."}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                {business.city && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <MapPin size={16} className="text-slate-400" />
                    {business.city}{business.province ? `, ${business.province}` : ''}
                  </div>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
                    <Phone size={16} className="text-slate-400" />
                    {business.phone}
                  </a>
                )}
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Right: Quick Stats / Info Widget */}
            <div className="w-full md:w-72 bg-slate-50 rounded-2xl p-6 border border-slate-100 shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Business Info</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Services</span>
                  <span className="text-sm font-black text-slate-900">{listings.length} Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Response Time</span>
                  <span className="text-sm font-black text-emerald-600">&lt; 2 Hours</span>
                </div>
                {business.yearsInOperation && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Experience</span>
                    <span className="text-sm font-black text-slate-900">{business.yearsInOperation}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Services / Listings Grid */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Our Services</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Select a service to view availability and book.</p>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Services Available</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">This business has not published any bookable services yet. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={listing.id} 
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    {imageUrls[listing.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrls[listing.id]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center">
                        <Calendar className="text-slate-300 w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Price Badge overlay */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg font-black text-slate-900 text-sm">
                      {listing.price} <span className="text-[10px] text-slate-500 uppercase tracking-widest">{listing.currency}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">
                      <span>{listing.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-slate-400">{listing.subcategory}</span>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 font-medium">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Clock size={14} className="text-slate-400" />
                        {listing.duration} mins
                      </div>
                      
                      <Link href={`/services/${listing.id}`} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 group-hover:text-blue-700 transition-colors">
                        Book Now <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 mix-blend-multiply">
            Powered by <Link href="/" className="text-blue-600">LesiBooking</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
