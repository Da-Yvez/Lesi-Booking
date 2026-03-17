import Navbar from "@/components/Navbar";
import PartnerHero from "@/components/partner/PartnerHero";
import PricingSection from "@/components/partner/PricingSection";

export default function PartnerLandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white selection:bg-blue-500/30">
        <PartnerHero />
        <PricingSection />
      </main>
    </>
  );
}
