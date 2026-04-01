"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, ShieldCheck, CheckCircle, 
  ChevronLeft, Share, Heart, Info, Calendar, CreditCard, ChevronRight, Navigation, ArrowRight
} from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../../amplify/data/resource";
import BookingCalendar from "@/components/booking/BookingCalendar";
import Link from "next/link";

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await client.models.Listing.get({ id });
        if (data) {
          setListing(data);
          // Fetch cover image
          if (data.coverImageKey) {
             try {
               const coverRes = await getUrl({ path: data.coverImageKey });
               setCoverUrl(coverRes.url.toString());
               setActiveImage(coverRes.url.toString());
             } catch (e) {
               console.warn("Could not fetch cover image", e);
             }
          }
          // Fetch gallery images
          if (data.galleryImageKeys && data.galleryImageKeys.length > 0) {
             const urls = await Promise.all(
               data.galleryImageKeys.map(async (key: string | null) => {
                 if (!key) return null;
                 try {
                   const res = await getUrl({ path: key });
                   return res.url.toString();
                 } catch (e) {
                   console.warn("Could not fetch gallery image", e);
                   return null;
                 }
               })
             );
             setGalleryUrls(urls.filter(Boolean) as string[]);
          }

          // Fetch Reviews
          const { data: revs } = await client.models.Review.list({
            filter: { listingId: { eq: id } }
          });
          setReviews(revs || []);

          // Fetch Similar Listings
          const { data: similar } = await client.models.Listing.list({
            filter: { 
              category: { eq: data.category },
              id: { ne: id },
              status: { eq: 'published' }
            },
            limit: 4
          });
          setSimilarListings(similar || []);

          // Check Review Eligibility & User
          try {
            const user = await getCurrentUser();
            setCurrentUser(user);
            
            if (user.signInDetails?.loginId) {
               const { data: bookings } = await client.models.Booking.list({
                 filter: { 
                   listingId: { eq: id },
                   status: { eq: 'confirmed' }
                 }
               });
               if (bookings && bookings.length > 0) setCanReview(true);
            }
          } catch (e) {
            // Not logged in
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
                <span>{listing.rating || 'New'}</span>
                <span className="text-slate-400 font-normal underline">({reviews.length} reviews)</span>
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

             {/* Custom Sections (About this item) */}
             {listing.additionalSections && JSON.parse(listing.additionalSections).length > 0 && JSON.parse(listing.additionalSections).map((sec: any, idx: number) => (
               <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                 <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">{sec.title}</h3>
                 <div className="text-slate-600 space-y-4 leading-relaxed font-medium text-[15px] whitespace-pre-wrap">
                   {sec.content}
                 </div>
               </div>
             ))}

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

              {/* Location */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-blue-600" /> Location
                </h3>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <p className="text-slate-900 font-bold mb-1">{listing.address || "Address details not provided"}</p>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Service Location</p>
                    
                    {listing.mapPin && (
                      <div className="mt-6">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${listing.mapPin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          View on Google Maps <ArrowRight size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {listing.mapPin && (
                    <div className="h-48 bg-slate-100 relative grayscale hover:grayscale-0 transition-all duration-500">
                      {/* Simple static placeholder map representation or actual Map pin if we had a static provider */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white animate-bounce shadow-xl shadow-blue-500/50 border-4 border-white">
                           <MapPin size={20} />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                           <Navigation size={14} className="animate-pulse" />
                         </div>
                         <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-900 uppercase">GPS Location Locked</p>
                           <p className="text-[10px] text-slate-500 font-bold">{listing.mapPin}</p>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews System */}
              <div className="space-y-8 pt-12 border-t border-slate-100 animate-in fade-in duration-1000">
                <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reviews & Feedback</h3>
                   <div className="flex items-center gap-2">
                     <Star size={20} className="fill-amber-400 text-amber-400" />
                     <span className="text-lg font-black">{listing.rating || 'New'}</span>
                     <span className="text-slate-400 text-sm">({reviews.length} reviews)</span>
                   </div>
                </div>

                {/* Review Eligibility & Form */}
                {canReview ? (
                  <div className="bg-blue-50/30 rounded-3xl p-8 border border-blue-100/50 backdrop-blur-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <CheckCircle size={18} className="text-blue-600" />
                       Verified Client Review
                    </h4>
                    <p className="text-xs text-slate-500 mb-6 font-medium">As a verified client, your feedback helps others. Thank you!</p>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        {[1,2,3,4,5].map(i => (
                          <button 
                            key={i} 
                            onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                            className={`transition-all hover:scale-110 ${reviewForm.rating >= i ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            <Star size={32} fill={reviewForm.rating >= i ? 'currentColor' : 'none'} strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                      <textarea 
                        className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[120px] font-medium"
                        placeholder="What was your experience like? Share your thoughts..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      />
                      <button 
                        onClick={async () => {
                          setSubmittingReview(true);
                          try {
                            await client.models.Review.create({
                              listingId: id,
                              userEmail: currentUser.signInDetails?.loginId || 'guest',
                              userName: currentUser.signInDetails?.loginId?.split('@')[0] || 'Guest User',
                              rating: reviewForm.rating,
                              comment: reviewForm.comment,
                              status: 'published'
                            });
                            
                            // Update listing stats
                            const newTotal = reviews.length + 1;
                            const newRating = ((listing.rating || 5) * reviews.length + reviewForm.rating) / newTotal;
                            await client.models.Listing.update({
                              id: id,
                              rating: parseFloat(newRating.toFixed(2)),
                              reviewCount: newTotal
                            });

                            setReviewForm({ rating: 5, comment: "" });
                            setCanReview(false);
                            // Refresh data
                            const { data: revs } = await client.models.Review.list({ filter: { listingId: { eq: id } } });
                            setReviews(revs || []);
                          } catch (e) {
                            console.error("Failed to submit review", e);
                          } finally {
                            setSubmittingReview(false);
                          }
                        }}
                        disabled={submittingReview}
                        className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 disabled:opacity-50 hover:-translate-y-0.5 transition-all active:translate-y-0"
                      >
                        {reviewForm.rating > 0 ? (submittingReview ? 'Posting Review...' : 'Post Detailed Review') : 'Select Stars to Post'}
                      </button>
                    </div>
                  </div>
                ) : !currentUser ? (
                   <div className="p-10 bg-slate-50/50 rounded-[2rem] text-center border border-dashed border-slate-200">
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Authenticated Reviews Only</p>
                     <p className="text-sm text-slate-500 font-medium">Please sign in to leave a review of this service.</p>
                   </div>
                ) : (
                   <div className="p-10 bg-slate-50/50 rounded-[2rem] text-center border border-dashed border-slate-200">
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Verified Clients Only</p>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">Only clients with confirmed appointments can leave reviews to ensure all feedback is 100% authentic.</p>
                   </div>
                )}

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reviews.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50/30 rounded-3xl border border-slate-100">
                      <p className="text-slate-400 text-sm font-medium italic">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  ) : reviews.map((rev, idx) => (
                    <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600 uppercase shadow-inner">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{rev.userName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                             <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-4">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Items Recommendations */}
              {similarListings.length > 0 && (
                <div className="pt-16 space-y-8 animate-in fade-in duration-1000">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Similar Services</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Recommended based on category</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {similarListings.map((sim, idx) => (
                      <Link key={sim.id} href={`/services/${sim.id}`} className="group space-y-3">
                        <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-100 shadow-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600/20 transition-all group-hover:scale-110">
                             <Star size={40} fill="currentColor" />
                          </div>
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                            {sim.price} {sim.currency}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{sim.subcategory}</p>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{sim.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                             <Star size={10} className="fill-amber-400 text-amber-400" />
                             <span>{sim.rating || 'NEW'}</span>
                             <span>•</span>
                             <span>{sim.duration}m</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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

                <button
                  onClick={() => setShowCalendar(true)}
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0"
                >
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

      {/* Booking Calendar Modal */}
      {showCalendar && listing && (
        <BookingCalendar
          listing={{
            id: listing.id,
            duration: listing.duration ?? 60,
            workingDays: listing.workingDays,
            timeSlots: listing.timeSlots,
            price: listing.price ?? 0,
            currency: listing.currency ?? "LKR",
            title: listing.title,
            bufferTime: listing.bufferTime ?? 0,
            acceptOnlinePayment: listing.acceptOnlinePayment ?? false,
            ownerEmail: listing.ownerEmail ?? "",
            businessName: listing.businessName ?? "",
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
