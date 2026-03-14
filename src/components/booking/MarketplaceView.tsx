"use client";

import { useState } from "react";
import { Star, MapPin, Search, Filter, CalendarCheck2 } from "lucide-react";
import AuthGateModal from "../AuthGateModal";

interface MarketplaceViewProps {
  categoryTitle: string;
}

// Dummy data for visual design
const MOCK_LISTINGS = [
  {
    id: 1,
    name: "Lumiere Premium Aesthetics",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    reviews: 128,
    distance: "1.2 km",
    price: "From $85",
    tags: ["Top Rated", "Available Today"],
    description: "Award-winning treatments combining luxury and relaxation.",
  },
  {
    id: 2,
    name: "Apex Wellness Center",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    reviews: 89,
    distance: "3.5 km",
    price: "From $65",
    tags: ["Verified", "Special Offers"],
    description: "Holistic care experts focused on recovery and balance.",
  },
  {
    id: 3,
    name: "The Vault Studio",
    image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    reviews: 215,
    distance: "0.8 km",
    price: "From $45",
    tags: ["Popular"],
    description: "Modern facility offering the perfect transformative experience.",
  },
  {
    id: 4,
    name: "Serenity Private Practice",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    reviews: 54,
    distance: "5.1 km",
    price: "From $120",
    tags: ["Premium"],
    description: "Exclusive consults focusing on deep, personalized care.",
  }
];

export default function MarketplaceView({ categoryTitle }: MarketplaceViewProps) {
  const [showAuthGate, setShowAuthGate] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar / Filters */}
      <aside className="hidden lg:block space-y-8">
        <div className="sticky top-24 p-6 rounded-3xl border border-white/10 bg-[#0d0d18] shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-white font-bold pb-4 border-b border-white/10">
            <Filter className="w-5 h-5 text-blue-500" />
            Filters
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Price Range</h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              <span className="text-slate-500">-</span>
              <input type="number" placeholder="Max" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Minimum Rating</h3>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5].map(rating => (
                <label key={rating} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" name="rating" className="w-4 h-4 accent-blue-500" />
                  <span className="flex items-center gap-1">{rating}+ <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /></span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Distance</h3>
            <input type="range" className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1km</span>
              <span>10km+</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {categoryTitle}
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Showing {MOCK_LISTINGS.length} premium services near you.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors w-full md:w-64"
            />
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_LISTINGS.map((listing) => (
            <div 
              key={listing.id} 
              className="group rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden shadow-xl"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-slate-800">
                <img 
                  src={listing.image} 
                  alt={listing.name}
                  className="w-full h-full object-cover origin-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-black/20 to-transparent" />
                
                {/* Tags overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content body */}
              <div className="p-6 space-y-4 border-t border-white/5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {listing.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {listing.rating} ({listing.reviews})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {listing.distance}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Starting at</div>
                    <div className="text-lg font-bold text-white text-blue-400">{listing.price}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>

                <button 
                  onClick={() => setShowAuthGate(true)}
                  className="w-full py-3 bg-white/5 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors border border-white/10 hover:border-blue-500 flex items-center justify-center gap-2 mt-4"
                >
                  <CalendarCheck2 className="w-4 h-4" /> Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuthGate && (
        <AuthGateModal
          intent="book"
          isOpen={true}
          onClose={() => setShowAuthGate(false)}
        />
      )}
    </div>
  );
}
