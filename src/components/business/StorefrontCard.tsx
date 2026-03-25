"use client";

import { useState } from "react";
import { Link2, Copy, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function StorefrontCard({ businessReg, onUpdate }: { businessReg: any, onUpdate?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(businessReg?.slug || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSlug = !!businessReg?.slug;
  const storefrontUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${businessReg?.slug}`
    : `https://lesibooking.com/${businessReg?.slug}`;

  const formatSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!slug) {
      setError("Slug cannot be empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Basic check for uniqueness (real app should have robust unique constraint)
      const { data } = await client.models.BusinessRegistration.list({
        filter: { slug: { eq: slug } }
      });
      if (data.length > 0 && data[0].id !== businessReg.id) {
        setError("This URL is already taken. Please choose another.");
        setLoading(false);
        return;
      }

      await client.models.BusinessRegistration.update({
        id: businessReg.id,
        slug: slug
      });
      
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to update URL");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!businessReg) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 border border-indigo-800 rounded-2xl overflow-hidden shadow-xl text-white">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        
        {/* Left Icon Area */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-inner backdrop-blur-sm">
          <Sparkles className="w-8 h-8 text-blue-300" />
        </div>

        {/* Content Area */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2 mb-1">
            Your Public Storefront
            {!hasSlug && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">Action Needed</span>}
          </h3>
          <p className="text-indigo-200 text-sm font-medium mb-4 max-w-xl">
            {hasSlug 
              ? "Share this link on your Instagram or Facebook bio so clients can view your services and book instantly." 
              : "Claim your unique URL so clients can find your services and book instantly."}
          </p>

          {editing || !hasSlug ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-lg">
              <div className="flex-1 relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 text-sm font-medium select-none">lesibooking.com/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(formatSlug(e.target.value))}
                  placeholder="my-business"
                  className="w-full pl-36 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all text-sm font-bold"
                />
              </div>
              <button 
                onClick={handleSave} 
                disabled={loading || !slug}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Claim URL"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white shadow-inner select-none pointer-events-none w-full sm:w-auto">
                <Link2 size={16} className="text-indigo-300" />
                {storefrontUrl}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-indigo-50 text-indigo-900 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button 
                  onClick={() => setEditing(true)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                >
                  Edit
                </button>
                <a 
                  href={`/${businessReg.slug}`}
                  target="_blank"
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hidden sm:flex items-center"
                >
                  Visit
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-300">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
