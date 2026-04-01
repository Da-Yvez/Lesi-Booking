"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Search, Navigation, Filter, Star, Clock, Loader2, ArrowRight } from "lucide-react";
import { getUrl } from "aws-amplify/storage";

// The actual Leaflet map needs to be dynamically imported with NO SSR
const InteractiveMap = dynamic(() => import("./MapClient"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <MapPin className="w-8 h-8 animate-bounce" />
        <p className="font-bold text-sm tracking-wide uppercase">Connecting to Satellites...</p>
      </div>
    </div>
  )
});

// Haversine formula to calculate straight-line distance between two coordinates in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function MapDiscovery({ initialListings }: { initialListings: any[] }) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualOrigin, setManualOrigin] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // 1. Ask for Geolocation on load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
          // Default to Colombo center if they block location
          setUserLocation({ lat: 6.9271, lng: 79.8612 });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setUserLocation({ lat: 6.9271, lng: 79.8612 });
    }
  }, []);

  // 2. Fetch images for listings
  useEffect(() => {
    async function fetchImages() {
      const urls: Record<string, string> = {};
      for (const listing of initialListings) {
        if (listing.coverImageKey) {
          try {
            const res = await getUrl({ path: listing.coverImageKey });
            urls[listing.id] = res.url.toString();
          } catch (e) {
            console.warn("Skipping image: missing credentials/access");
          }
        }
      }
      setImageUrls(urls);
    }
    fetchImages();
  }, [initialListings]);

  // 3. Filter and Sort logic
  const processedListings = useMemo(() => {
    let result = [...initialListings];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter(l => l.category === activeCategory);
    }

    // Distance calculation and sorting
    const effectiveOrigin = manualOrigin || userLocation;

    if (effectiveOrigin) {
      result = result.map(listing => {
        const [lat, lng] = listing.mapPin.split(',').map(Number);
        const distance = getDistanceFromLatLonInKm(effectiveOrigin.lat, effectiveOrigin.lng, lat, lng);
        return { ...listing, distance, parsedCoords: { lat, lng } };
      });
      
      // Sort: Nearby First
      result.sort((a, b) => a.distance - b.distance);
    } else {
      result = result.map(listing => {
        const [lat, lng] = listing.mapPin.split(',').map(Number);
        return { ...listing, distance: null, parsedCoords: { lat, lng } };
      });
    }

    return result;
  }, [initialListings, searchQuery, activeCategory, userLocation]);

  const categories = ["All", ...Array.from(new Set(initialListings.map(l => l.category)))];

  return (
    <div className="flex-1 flex flex-col md:flex-row relative">
      
      {/* LEFT PANEL: Filters and List */}
      <div className="w-full md:w-[450px] lg:w-[500px] h-[50vh] md:h-full bg-white flex flex-col shadow-2xl z-20 shrink-0">
        
        {/* Header / Search */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors mb-1 w-fit bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-200 group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            Back to Booking
          </Link>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search services or categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scroll">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {manualOrigin ? (
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-full">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="animate-pulse" /> Manual Search Origin Set
              </div>
              <button 
                onClick={() => setManualOrigin(null)}
                className="text-[10px] underline hover:text-amber-700"
              >
                Reset to GPS
              </button>
            </div>
          ) : userLocation ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
              <Navigation size={14} /> Sorted by Nearby First
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Loader2 size={14} className="animate-spin" /> Locating you to find nearby services...
            </div>
          )}
        </div>

        {/* Listings Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {processedListings.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria or zooming out on the map.</p>
            </div>
          ) : (
            processedListings.map(listing => (
              <div 
                key={listing.id}
                onMouseEnter={() => setHoveredListingId(listing.id)}
                onMouseLeave={() => setHoveredListingId(null)}
                className="group flex gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all cursor-pointer"
              >
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                   {imageUrls[listing.id] ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={imageUrls[listing.id]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <Star className="text-slate-300 w-6 h-6" />
                     </div>
                   )}
                </div>
                
                <div className="flex-1 py-0.5 flex flex-col min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {listing.category}
                    </span>
                    {listing.distance !== null && (
                      <span className="text-[9px] font-black tracking-wider text-slate-500 flex items-center gap-1">
                        <MapPin size={9} /> {listing.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 mb-auto font-medium leading-relaxed">
                    {listing.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-50">
                    <span className="font-black text-sm text-slate-900 flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">{listing.currency}</span>
                      {listing.price}
                    </span>
                    <Link href={`/services/${listing.id}`} className="text-[10px] font-bold text-white bg-slate-900 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors">
                      Book View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 h-[50vh] md:h-full relative z-10">
        <InteractiveMap 
          listings={processedListings as any} 
          userLocation={userLocation}
          manualOrigin={manualOrigin}
          hoveredListingId={hoveredListingId}
          onMapClick={(lat: number, lng: number) => setManualOrigin({ lat, lng })}
        />
      </div>

    </div>
  );
}
