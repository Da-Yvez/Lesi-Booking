"use client";

import { useEffect, useState } from "react";
import MapDiscovery from "@/components/explore/MapDiscovery";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../amplify/data/resource";
import { Loader2 } from "lucide-react";

export default function ExplorePage() {
  const client = generateClient<Schema>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data } = await client.models.Listing.list({
          filter: { status: { eq: 'published' } }
        });
        // Filter out listings without valid map coordinates
        const maps = (data || []).filter(l => l.mapPin && l.mapPin.includes(','));
        setListings(maps);
      } catch (e) {
        console.error("Failed to fetch listings for explore", e);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Loading Map Engine...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Client component for interactive parts */}
      <MapDiscovery initialListings={listings} />
    </div>
  );
}

