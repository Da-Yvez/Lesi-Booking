import { notFound } from "next/navigation";
import MarketplaceView from "@/components/booking/MarketplaceView";
import Navbar from "@/components/Navbar";

// We'll scaffold some mock categories to validate against
const validCategories = [
  "salon-hair", "medical-clinic", "dental-care", "spa-wellness", 
  "gym-fitness", "barbershop", "makeup-beauty", "physiotherapy", 
  "veterinary", "photography", "tutoring", "legal-services"
];

export default async function CategoryListingPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  // Format the slug back to a readable title
  const title = category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" & ");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080810] pt-24 pb-12">
        <MarketplaceView categoryTitle={title} />
      </main>
    </>
  );
}
