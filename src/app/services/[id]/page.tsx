"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, ShieldCheck, CheckCircle, 
  ChevronLeft, Share, Heart, Info, Calendar, CreditCard, ChevronRight
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await client.models.Listing.get({ id });
        if (data) {
          setListing(data);
          // Fetch cover image
          if (data.coverImageKey) {
             const coverRes = await getUrl({ path: data.coverImageKey });
             setCoverUrl(coverRes.url.toString());
             setActiveImage(coverRes.url.toString());
          }
          // Fetch gallery images
          if (data.galleryImageKeys && data.galleryImageKeys.length > 0) {
             const urls = await Promise.all(
               data.galleryImageKeys.map(async (key: string | null) => {
                 if (!key) return null;
                 const res = await getUrl({ path: key });
                 return res.url.toString();
               })
             );
             setGalleryUrls(urls.filter(Boolean) as string[]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch listing details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
           <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 shadow-inner">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           </div>
           <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Loading Experience</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Service Not Found</h1>
          <p className="text-slate-500 mb-6">This offering may have been removed or is currently unavailable.</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Return Home</button>
        </div>
      </div>
    );
  }

  const allImages = [coverUrl, ...galleryUrls].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Secondary Navigation */}
      <div className="bg-white px-6 pt-6 pb-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition-colors"
           >
             <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                <ChevronLeft size={20} />
             </div>
             <span className="hidden sm:inline">Back to discovery</span>
           </button>
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                <Share size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                <Heart size={18} />
              </button>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Title Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                {listing.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <MapPin size={12} />
                {listing.city || "Remote"} {listing.country && `, ${listing.country}`}
              </span>
           </div>
           <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
             {listing.title}
           </h1>
           <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
             <div className="flex items-center gap-1.5 text-slate-900">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>4.96</span>
                <span className="text-slate-400 font-normal underline">(128 reviews)</span>
             </div>
             <span>•</span>
             <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Verified Partner</span>
             </div>
           </div>
        </div>

        {/* Hero Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 h-[50vh] md:h-[60vh] max-h-[600px] min-h-[400px] animate-in fade-in zoom-in duration-1000">
           {/* Main Image */}
           <div className="md:col-span-3 relative rounded-3xl overflow-hidden group">
             {activeImage ? (
               <Image 
                 src={activeImage} 
                 alt="Main Service" 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-1000"
                 sizes="(max-width: 768px) 100vw, 75vw"
                 priority
               />
             ) : (
               <div className="w-full h-full bg-slate-100" />
             )}
           </div>

           {/* Thumbnails */}
           <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
             {allImages.map((img, idx) => (
               <button 
                 key={idx}
                 onClick={() => setActiveImage(img)}
                 className={`relative h-[calc(33.333%-10px)] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-600' : 'border-transparent hover:opacity-80'}`}
               >
                 <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" sizes="25vw" />
               </button>
             ))}
           </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Details (Left) */}
          <div className="flex-1 space-y-12">
             
             {/* Host/Partner Info */}
             <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 mb-1">
                     Provided by {listing.businessName}
                   </h2>
                   <p className="text-sm text-slate-500 font-medium">{listing.yearsInOperation || '2+'} years experience • Exceptional service</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-black text-blue-600">
                   {listing.businessName?.charAt(0) || 'P'}
                </div>
             </div>

             {/* Description */}
             <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">About this service</h3>
                <div className="text-slate-600 space-y-4 leading-relaxed font-medium text-[15px] whitespace-pre-wrap">
                  {listing.description}
                </div>
             </div>

             {/* Highlights */}
             <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Service Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-4 items-start">
                     <Clock className="w-6 h-6 text-blue-600 shrink-0" />
                     <div>
                       <p className="font-bold text-slate-900 text-sm">Duration</p>
                       <p className="text-sm text-slate-500 mt-0.5">{listing.duration} minutes of dedicated service</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
                     <div>
                       <p className="font-bold text-slate-900 text-sm">Instant Confirmation</p>
                       <p className="text-sm text-slate-500 mt-0.5">Your booking is confirmed immediately</p>
                     </div>
                  </div>
                </div>
             </div>

             {/* Policies */}
             <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" /> Keep in mind
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{listing.cancellationPolicy || "Free cancellation up to 24 hours before the appointment."}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">No-show Policy</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{listing.noShowPolicy || "Full amount may be charged for no-shows."}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Payment Methods</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {listing.paymentMethods?.map((m: string) => (
                         <span key={m} className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 uppercase tracking-wider">{m.replace('_', ' ')}</span>
                      )) || <span className="text-sm text-slate-600">Card & Cash accepted</span>}
                    </div>
                  </div>
                </div>
             </div>

          </div>

          {/* Sticky Reservation Widget (Right) */}
          <div className="w-full lg:w-[420px] shrink-0">
             <div className="sticky top-28 bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 overflow-hidden">
                {/* Price Header */}
                <div className="flex items-end gap-2 mb-6">
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                     {listing.price}
                   </h2>
                   <span className="text-lg font-bold text-slate-400 mb-1">{listing.currency}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <Calendar className="text-blue-600 w-5 h-5 bg-white rounded-lg p-0.5 shadow-sm" />
                     <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                       <p className="text-sm font-bold text-slate-900">Select date & time</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  {listing.depositRequired && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-amber-800">
                       <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                       <div className="text-xs">
                         <span className="font-bold block mb-0.5">Deposit Required</span>
                         A small deposit is required to secure this booking.
                       </div>
                    </div>
                  )}
                </div>

                <button className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0">
                  Select Schedule
                </button>

                <p className="text-center text-[11px] font-bold text-slate-400 mt-4">
                  You won&apos;t be charged yet
                </p>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                   <span>Total amount</span>
                   <span>{listing.price} {listing.currency}</span>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
