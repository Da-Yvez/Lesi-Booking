"use client";

import { useEffect, useState, use } from "react";
import Storefront from "@/components/storefront/Storefront";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

const client = generateClient<Schema>();

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const [business, setBusiness] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStorefront() {
      try {
        const { data: bData } = await client.models.BusinessRegistration.list({
          filter: { slug: { eq: slug } }
        });

        if (!bData || bData.length === 0) {
          notFound();
          return;
        }

        const activeBusiness = bData[0];
        setBusiness(activeBusiness);

        // Fetch published listings for this business
        const { data: lData } = await client.models.Listing.list({
          filter: { 
            businessRegistrationId: { eq: activeBusiness.id },
            status: { eq: 'published' }
          }
        });
        setListings(lData || []);
      } catch (err) {
        console.error("Failed to fetch storefront", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchStorefront();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!business) return null;

  return <Storefront business={business} listings={listings} />;
}
