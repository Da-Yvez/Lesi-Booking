"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ClipboardList, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { name: "Business Info", href: "/partner/dashboard/info", icon: Store },
  { name: "Listings", href: "/partner/dashboard/listings", icon: Package },
  { name: "Orders/Bookings", href: "/partner/dashboard/bookings", icon: ClipboardList },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0d1117] flex flex-col fixed inset-y-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">L</div>
          <span className="text-xl font-bold tracking-tight text-white">Lesi<span className="text-blue-500">Booking</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            href="/partner/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Settings size={18} />
            Settings
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0d1117]/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-8">
          <h2 className="text-sm font-medium text-slate-400">
            Welcome back, <span className="text-white">Partner</span>
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0d1117]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
