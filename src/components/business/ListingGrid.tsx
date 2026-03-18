"use client";

import { Plus, Package, Edit2, Trash2, Eye } from "lucide-react";

const DUMMY_LISTINGS = [
  { id: 1, name: "Consultation Session", price: "49.00", category: "Service", status: "Active" },
  { id: 2, name: "Full Day Booking", price: "299.00", category: "Service", status: "Active" },
  { id: 3, name: "Equipment Rental", price: "75.00", category: "Booking", status: "Draft" },
];

export default function ListingGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Listings & Services</h3>
          <p className="text-gray-500 text-sm mt-1">Manage your current offerings and create new ones.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} />
          New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_LISTINGS.map((listing) => (
          <div key={listing.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-gray-300 hover:shadow-md shadow-sm transition-all">
            <div className="h-40 bg-gray-50 flex items-center justify-center relative border-b border-gray-100">
              <Package size={40} className="text-gray-300" />
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  listing.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {listing.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{listing.category}</p>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{listing.name}</h4>
              <p className="text-gray-500 text-sm mb-4">Starting from <span className="text-gray-900 font-bold">${listing.price}</span></p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="View details">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit listing">
                    <Edit2 size={18} />
                  </button>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete listing">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <button className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:bg-blue-50 transition-all group h-full min-h-[250px]">
          <div className="p-4 rounded-full bg-gray-50 group-hover:bg-blue-100 transition-all">
            <Plus size={32} className="text-gray-400 group-hover:text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-bold">Add New Service</p>
            <p className="text-gray-500 text-xs mt-1">Ready to expand? Add a new offering.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
