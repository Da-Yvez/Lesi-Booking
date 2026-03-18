"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthState } from "@/lib/authGuard";
import { 
  Sparkles, 
  Layers, 
  Zap, 
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  ArrowRight 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getAuthState().then((s) => setAuthed(s.authed));
  }, [pathname]);

  // Hide on auth, admin, and dashboard routes
  if (
    pathname === "/login" || 
    pathname === "/logout" || 
    pathname === "/admin/login" || 
    pathname === "/admin" || 
    pathname === "/partner/checkout" ||
    pathname?.startsWith("/partner/dashboard")
  ) return null;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[95%] xl:max-w-screen-2xl px-4">
      <div className="glass rounded-3xl px-8 py-3 flex items-center justify-between border border-white/10 shadow-2xl shadow-blue-500/10 transition-all hover:border-white/20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Lesi<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Booking</span>
          </span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { name: "Features", href: "#features", icon: Zap },
            { name: "Solutions", href: "#solutions", icon: Layers },
            { name: "Pricing", href: "#pricing", icon: CreditCard },
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group"
            >
              <item.icon size={16} className="group-hover:text-blue-400 transition-colors" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <Link
                href="/partner/dashboard"
                className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white text-sm font-bold px-4 py-2 transition-all hover:bg-white/5 rounded-xl"
              >
                <LayoutDashboard size={18} className="text-blue-500" />
                Dashboard
              </Link>
              <Link
                href="/logout"
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-white/5"
              >
                <LogOut size={18} className="text-red-400" />
                <span className="hidden xs:inline">Sign Out</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login?mode=signup"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95 group"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
