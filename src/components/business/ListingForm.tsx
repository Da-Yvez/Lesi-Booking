"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "../../../amplify/data/resource";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const client = generateClient<Schema>();

export default function ListingForm({ ownerEmail, businessRegId, businessName }: { ownerEmail: string, businessRegId: string, businessName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // A. Identity
    title: "", category: "Service", subcategory: "",
    // B. Content
    description: "", instructions: "", tags: "",
    // C. Pricing
    price: "", currency: "LKR", duration: "60", bufferTime: "15", discount: "",
    // D. Location
    address: "", mapPin: "", serviceType: "on_site" as "on_site" | "at_home" | "online",
    // E. Media
    coverImage: null as File | null,
    // F. Availability
    workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    timeSlots: "09:00-17:00",
    maxBookingsPerSlot: "1",
    // G. Capacity
    maxCustomers: "1", ageRestrictions: "", genderSpecific: "Any",
    // H. Payment
    acceptOnlinePayment: false, depositRequired: false,
    // I. Policies
    cancellationPolicy: "24 hours notice required",
    // J. Visibility
    enableReviews: true,
  });

  const next = () => setStep(s => Math.min(6, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const update = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let coverImageKey = "default.jpg";
      
      if (form.coverImage) {
        const ext = form.coverImage.name.split('.').pop();
        coverImageKey = `listings/${businessRegId}-${Date.now()}.${ext}`;
        await uploadData({
          path: coverImageKey,
          data: form.coverImage,
          options: { contentType: form.coverImage.type }
        }).result;
      }

      const { errors } = await client.models.Listing.create({
        ownerEmail,
        businessRegistrationId: businessRegId,
        businessName,
        title: form.title,
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        instructions: form.instructions || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        
        price: parseFloat(form.price) || 0,
        currency: form.currency,
        duration: parseInt(form.duration) || 60,
        bufferTime: parseInt(form.bufferTime) || 0,
        discount: form.discount || null,
        
        address: form.address,
        mapPin: form.mapPin || null,
        serviceType: form.serviceType,

        coverImageKey,
        
        workingDays: JSON.stringify(form.workingDays),
        timeSlots: JSON.stringify(form.timeSlots),
        maxBookingsPerSlot: parseInt(form.maxBookingsPerSlot) || 1,
        
        maxCustomersPerBooking: parseInt(form.maxCustomers) || 1,
        ageRestrictions: form.ageRestrictions || null,
        genderSpecific: form.genderSpecific,

        acceptOnlinePayment: form.acceptOnlinePayment,
        depositRequired: form.depositRequired,
        
        cancellationPolicy: form.cancellationPolicy,
        enableReviews: form.enableReviews,
        isFeatured: false,
        status: "pending_approval"
      });

      if (errors && errors.length > 0) throw new Error(errors[0].message);

      router.push("/partner/dashboard?listing=created");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border text-gray-900 border-gray-200 shadow-sm rounded-2xl max-w-4xl mx-auto overflow-hidden">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-bold">Create New Listing</h2>
          <p className="text-gray-500 text-sm mt-1">Step {step} of 6</p>
        </div>
        <div className="flex gap-1.5 hide-scroll">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${step >= i ? 'w-8 bg-blue-600' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="p-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">1. Identity & Content</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Listing Title *</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="e.g. Premium Haircut" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl">
                  <option>Service</option><option>Appointment</option><option>Rental</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Subcategory *</label>
                <input value={form.subcategory} onChange={e => update('subcategory', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="e.g. Barbershop" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Description *</label>
                <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="Describe your service..."></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">2. Pricing & Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Price *</label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 bg-gray-50 text-gray-500">{form.currency}</span>
                  <input type="number" value={form.price} onChange={e => update('price', e.target.value)} className="w-full px-4 py-2 border rounded-r-xl" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Duration (Minutes) *</label>
                <input type="number" value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="60" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Buffer Time (Minutes)</label>
                <input type="number" value={form.bufferTime} onChange={e => update('bufferTime', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="15" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">3. Location & Media</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Service Type *</label>
                 <select value={form.serviceType} onChange={e => update('serviceType', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl">
                   <option value="on_site">On-site (Customer visits)</option>
                   <option value="at_home">At-home (Provider visits)</option>
                   <option value="online">Online</option>
                 </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Full Address</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="123 Street Name, City" />
              </div>
              <div className="col-span-2 mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase">Cover Image *</label>
                <input type="file" accept="image/*" onChange={e => update('coverImage', e.target.files?.[0] || null)} className="w-full mt-1 px-4 py-2 border rounded-xl bg-gray-50" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">4. Availability</h3>
             <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Working Days</label>
                  <div className="flex gap-2 flex-wrap">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                      <button key={day} onClick={() => update('workingDays', {...form.workingDays, [day]: !(form.workingDays as any)[day]})} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                          (form.workingDays as any)[day] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase">Time Slots Available</label>
                 <input value={form.timeSlots} onChange={e => update('timeSlots', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" placeholder="09:00-17:00" />
               </div>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">5. Capacity & Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Max Customers Per Booking</label>
                <input type="number" value={form.maxCustomers} onChange={e => update('maxCustomers', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Gender Specific?</label>
                <select value={form.genderSpecific} onChange={e => update('genderSpecific', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl">
                   <option>Any</option><option>Male Only</option><option>Female Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b pb-2">6. Payment & Policies</h3>
            <div className="space-y-4">
               <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                 <input type="checkbox" checked={form.acceptOnlinePayment} onChange={e => update('acceptOnlinePayment', e.target.checked)} className="w-5 h-5 rounded border-gray-300" />
                 <div><p className="font-bold text-sm">Accept Online Payments</p><p className="text-xs text-gray-500">Allow customers to pay via card or wallet</p></div>
               </label>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Cancellation Policy</label>
                  <input value={form.cancellationPolicy} onChange={e => update('cancellationPolicy', e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-xl" />
               </div>
            </div>
          </div>
        )}

      </div>

      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <button onClick={prev} disabled={step === 1} className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent">
          <ArrowLeft size={16} /> Back
        </button>
        {step < 6 ? (
          <button onClick={next} className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md">
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md disabled:bg-opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Submit Listing
          </button>
        )}
      </div>

    </div>
  );
}
