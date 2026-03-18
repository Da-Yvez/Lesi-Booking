"use client";

import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Clock 
} from "lucide-react";

const STATS = [
  { 
    name: "Total Orders", 
    value: "124", 
    change: "+12.5%", 
    trend: "up", 
    icon: ShoppingBag, 
    color: "blue" 
  },
  { 
    name: "Active Listings", 
    value: "12", 
    change: "+2", 
    trend: "up", 
    icon: TrendingUp, 
    color: "purple" 
  },
  { 
    name: "New Leads", 
    value: "45", 
    change: "+5.4%", 
    trend: "up", 
    icon: Users, 
    color: "pink" 
  },
  { 
    name: "Pending Tasks", 
    value: "3", 
    change: "-1", 
    trend: "down", 
    icon: Clock, 
    color: "orange" 
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
