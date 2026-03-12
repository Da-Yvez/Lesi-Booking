import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent relative">
      <Hero />
      <Features />
      
      {/* Footer-like section */}
      <footer className="py-20 text-center border-t border-white/5">
        <p className="text-slate-500 text-sm italic">
          Designed for professionals by LesiBooking. &copy; 2026
        </p>
      </footer>
    </main>
  );
}
