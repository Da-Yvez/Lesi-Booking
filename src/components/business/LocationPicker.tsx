"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPickerClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-2" />
      <p className="text-sm font-medium">Loading interactive map...</p>
    </div>
  ),
});

export default function LocationPicker({ 
  value, 
  onChange 
}: { 
  value?: string; 
  onChange: (val: string) => void 
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase">
        Pinpoint Location *
      </label>
      <p className="text-sm text-gray-500 font-medium">Click on the map to drop a pin exactly at your storefront. This is used to show you to nearby clients.</p>
      
      <MapPicker value={value} onChange={onChange} />
      
      {value && (
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <MapPin size={14} /> Coordinates Saved: {value}
        </div>
      )}
    </div>
  );
}
