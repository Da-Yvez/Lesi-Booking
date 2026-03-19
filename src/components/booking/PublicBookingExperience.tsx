"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, MapPin, Star, Calendar, 
  ChevronRight, Laptop, Home, Building, 
  Tag as TagIcon, Clock, Loader2
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

const categoriesList = [
  "All",
  "Salon & Hair",
  "Medical Clinic",
  "Dental Care",
  "Spa & Wellness",
  "Gym & Fitness",
  "Barbershop",
  "Makeup & Beauty",
  "Physiotherapy",
  "Veterinary",
  "Photography",
  "Tutoring",
  "Legal Services"
];

function ListingCard({ listing }: { listing: any }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      if (!listing.coverImageKey) return;
      try {
        const result = await getUrl({ path: listing.coverImageKey });
        setImageUrl(result.url.toString());
      } catch (err) {
        console.error("Failed to load listing image", err);
      } finally {
        setLoadingImg(false);
      }
    }
    fetchImage();
  }, [listing.coverImageKey]);

  const ServiceIcon = listing.serviceType === 'online' ? Laptop : 
                    listing.serviceType === 'at_home' ? Home : Building;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 shrink-0">
        {loadingImg ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={listing.title} 
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <Building className="w-10 h-10 text-slate-200" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm border border-white">
            {listing.category}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl">
             <ChevronRight size={20} />
           </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">
            <ServiceIcon size={12} strokeWidth={2.5} />
            {listing.serviceType?.replace('_', ' ')}
          </div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {listing.title}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
             <span className="text-slate-400 font-medium italic">by</span>
             {listing.businessName || "Professional Partner"}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Starting</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-lg font-black text-slate-900">{listing.price}</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{listing.currency}</span>
              </div>
           </div>
           
           <div className="text-right">
              <div className="flex items-center gap-1 text-[10px] font-black text-slate-900 mb-1">
                 <Star size={12} className="text-amber-400 fill-amber-400" />
                 <span>NEW</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                 <Clock size={11} />
                 {listing.duration}m
              </p>
           </div>
        </div>
        
        <Link href={`/services/${listing.id}`} className="w-full mt-5">
          <button className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-blue-600 text-slate-900 hover:text-white text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 active:scale-[0.98]">
             Reserve Service
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function PublicBookingExperience() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data } = await client.models.Listing.list({
          filter: { status: { eq: 'published' } }
        });
        setListings(data || []);
      } catch (err) {
        console.error("Failed to fetch public listings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const sortedCategories = categoriesList;

  const filtered = listings.filter(l => {
    const matchesCategory = selectedCategory === "All" || l.category === selectedCategory;
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                         l.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fcfdfe] relative selection:bg-blue-600 selection:text-white">
      {/* Decorative background element */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-blue-50/20 blur-[150px] -z-10 rounded-full" />
      <div className="fixed bottom-0 left-0 w-1/4 h-1/4 bg-blue-100/10 blur-[120px] -z-10 rounded-full" />

      {/* Modern Compact Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-100/80 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0 group cursor-default">
               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:rotate-6 transition-transform duration-500">
                  <Calendar size={24} strokeWidth={2.5} />
               </div>
               <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">LexiBooking</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-80">Premium Services</p>
               </div>
            </div>

            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search premium services, salons or doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-3xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all shadow-inner font-medium"
              />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto uppercase tracking-widest text-[10px] font-black text-slate-400">
               <span className="w-2 h-2 rounded-full bg-emerald-500" />
               Realtime Market
            </div>
          </div>

          {/* Category Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 scroll-smooth">
            {sortedCategories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 translate-y-[-2px]" 
                      : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
             </div>
             <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Connecting to Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40 max-w-sm mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">
             <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mx-auto border border-slate-50">
                <Search className="w-10 h-10 text-slate-200" />
             </div>
             <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Empty Discovery</h2>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">We couldn&apos;t find any published services in the <span className="text-blue-600">{selectedCategory}</span> category.</p>
             </div>
             <button 
               onClick={() => { setSelectedCategory("All"); setSearch(""); }}
               className="h-12 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-[0.98] transition-all"
             >
               Reset Discovery
             </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
               <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Available Services</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-blue-600">{filtered.length} curated listings</span> near your location
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by</span>
                  <select className="bg-white border-none rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-500/10 cursor-pointer pl-2 pr-8 py-2">
                     <option>Recommended</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                  </select>
               </div>
            </div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
         <button className="h-16 w-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-900/30">
            <Filter size={24} />
         </button>
      </div>
    </div>
  );
}
