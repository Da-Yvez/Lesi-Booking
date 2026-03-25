"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in NextJS
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (v: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export default function MapPickerClient({ 
  value, 
  onChange 
}: { 
  value?: string; 
  onChange: (val: string) => void 
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  // Parse existing "lat,lng"
  useEffect(() => {
    if (value && value.includes(",")) {
      const [lat, lng] = value.split(",");
      if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
         setPosition(new L.LatLng(Number(lat), Number(lng)));
      }
    }
  }, [value]);

  const handleSetPosition = (pos: L.LatLng) => {
    setPosition(pos);
    onChange(`${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`);
  };

  // Default to Colombo center if no position
  const defaultCenter: L.LatLngExpression = [6.9271, 79.8612];

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
      <MapContainer 
        center={position ? [position.lat, position.lng] : defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={handleSetPosition} />
      </MapContainer>
    </div>
  );
}
