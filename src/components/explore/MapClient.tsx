"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Star, Clock } from "lucide-react";

// Fix Leaflet's default icon paths
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// A custom "active" icon for when a card is hovered
const activeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// A component to automatically refit the map when listings change
function MapController({ 
  listings, 
  userLocation 
}: { 
  listings: any[], 
  userLocation: {lat: number, lng: number} | null 
}) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0 && !userLocation) return;

    const bounds = L.latLngBounds([]);
    
    // Add user location if present
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Add all listings
    listings.forEach(l => {
      if (l.parsedCoords) {
        bounds.extend([l.parsedCoords.lat, l.parsedCoords.lng]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, listings, userLocation]);

  return null;
}

// A component to handle map clicks
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapClient({ 
  listings, 
  userLocation,
  manualOrigin,
  hoveredListingId,
  onMapClick
}: { 
  listings: any[], 
  userLocation: {lat: number, lng: number} | null,
  manualOrigin: {lat: number, lng: number} | null,
  hoveredListingId: string | null,
  onMapClick: (lat: number, lng: number) => void
}) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[6.9271, 79.8612]} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController listings={listings} userLocation={manualOrigin || userLocation} />
        <ClickHandler onMapClick={onMapClick} />

        {/* User Location Marker (GPS) */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); opacity: 0.6;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-center italic">Your GPS Location</div>
            </Popup>
          </Marker>
        )}

        {/* Manual Search Origin Marker (Amber) */}
        {manualOrigin && (
          <Marker 
            position={[manualOrigin.lat, manualOrigin.lng]}
            icon={L.divIcon({
              className: 'custom-manual-marker',
              html: `<div style="background-color: #f59e0b; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-center">Searching from here</div>
            </Popup>
          </Marker>
        )}

        {/* Business Listings Markers */}
        {listings.map(listing => {
          const isActive = hoveredListingId === listing.id;
          
          return (
            <Marker 
              key={listing.id}
              position={[listing.parsedCoords.lat, listing.parsedCoords.lng]}
              icon={isActive ? activeIcon : defaultIcon}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="w-48 text-left p-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">
                    {listing.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <Clock size={12} /> {listing.duration} mins
                  </div>
                  <Link 
                    href={`/services/${listing.id}`} 
                    className="block text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
                  >
                    Book for {listing.currency} {listing.price}
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
