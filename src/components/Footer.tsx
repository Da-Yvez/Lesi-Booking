"use client";

import Link from "next/link";
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github 
} from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Solutions", href: "#solutions" },
      { name: "Pricing", href: "#pricing" },
      { name: "Releases", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Blog", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Safety Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Partner Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Compliance", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-slate-900 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Lesi<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Booking</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The next generation booking platform for professionals and businesses. Streamline your operations and grow your brand with ease.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 rounded-lg bg-slate-900/50 text-slate-500 hover:text-white transition-colors">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-slate-900/50 text-slate-500 hover:text-white transition-colors">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-slate-900/50 text-slate-500 hover:text-white transition-colors">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-slate-900/50 text-slate-500 hover:text-white transition-colors">
                <Github size={18} />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="space-y-6">
              <h4 className="text-sm font-bold text-white tracking-widest uppercase">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-slate-500 hover:text-blue-400 text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 mb-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Us</p>
              <p className="text-sm text-slate-300 font-medium">contact@lesibooking.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Call Us</p>
              <p className="text-sm text-slate-300 font-medium">+1 (555) 000-0000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visit Us</p>
              <p className="text-sm text-slate-300 font-medium">123 Booking Ave, Suite 100</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-900 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-xs">
            &copy; 2026 LesiBooking Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-xs text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
