"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const categories = [
  { name: "Salon & Hair", icon: "✂️", tagline: "Cuts, colour & styling", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", glow: "group-hover:shadow-pink-500/20" },
  { name: "Medical Clinic", icon: "🏥", tagline: "GP, specialists & more", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", glow: "group-hover:shadow-green-500/20" },
  { name: "Dental Care", icon: "🦷", tagline: "Checkups, whitening & braces", color: "from-cyan-500/20 to-sky-500/20", border: "border-cyan-500/30", glow: "group-hover:shadow-cyan-500/20" },
  { name: "Spa & Wellness", icon: "🧘", tagline: "Massage, facials & relaxation", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", glow: "group-hover:shadow-violet-500/20" },
  { name: "Gym & Fitness", icon: "💪", tagline: "Personal training & classes", color: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", glow: "group-hover:shadow-orange-500/20" },
  { name: "Barbershop", icon: "💈", tagline: "Fades, shaves & grooming", color: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", glow: "group-hover:shadow-red-500/20" },
  { name: "Makeup & Beauty", icon: "💄", tagline: "Bridal, parties & everyday", color: "from-fuchsia-500/20 to-pink-500/20", border: "border-fuchsia-500/30", glow: "group-hover:shadow-fuchsia-500/20" },
  { name: "Physiotherapy", icon: "🩺", tagline: "Rehab, pain relief & recovery", color: "from-teal-500/20 to-emerald-500/20", border: "border-teal-500/30", glow: "group-hover:shadow-teal-500/20" },
  { name: "Veterinary", icon: "🐾", tagline: "Checkups, vaccines & care", color: "from-lime-500/20 to-green-500/20", border: "border-lime-500/30", glow: "group-hover:shadow-lime-500/20" },
  { name: "Photography", icon: "📷", tagline: "Portraits, events & studios", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", glow: "group-hover:shadow-yellow-500/20" },
  { name: "Tutoring", icon: "📚", tagline: "One-on-one academic sessions", color: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-500/30", glow: "group-hover:shadow-indigo-500/20" },
  { name: "Legal Services", icon: "⚖️", tagline: "Consultations & advice", color: "from-slate-500/20 to-zinc-500/20", border: "border-slate-500/30", glow: "group-hover:shadow-slate-500/20" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } as const },
};

export default function CategoryGrid() {
  const router = useRouter();

  const handleSelect = (category: string) => {
    // Convert to URL friendly slug (e.g. "Salon & Hair" -> "salon-hair")
    const slug = category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    router.push(`/book/${slug}`);
  };

  return (
    <section className="min-h-screen bg-[#080810] px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
            What are you looking for?
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Choose a{" "}
            <span className="text-blue-400">
              Category
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Browse services by type. Find the best professionals near you and book in seconds.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              variants={cardVariants}
              onClick={() => handleSelect(cat.name)}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} text-left hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 shadow-xl ${cat.glow} hover:shadow-2xl overflow-hidden`}
            >
              {/* Glow blob */}
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl bg-white/5 group-hover:bg-white/10 transition-all" />

              <div className="relative space-y-3">
                <span className="text-4xl block drop-shadow-lg">{cat.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{cat.tagline}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Search hint */}
        <div className="text-center">
          <p className="text-slate-600 text-sm">
            Can&apos;t find what you&apos;re looking for?{" "}
            <button className="text-blue-400 hover:text-blue-300 underline transition-colors">
              Search all services
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
