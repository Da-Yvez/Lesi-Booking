import { LaserHero as Hero } from "@/components/ui/laser-focus-crypto-hero-section";
import BookingShowcase from "@/components/BookingShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent relative">
      <Hero />
      <BookingShowcase />
      <Footer />
    </main>
  );
}
