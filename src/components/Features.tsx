const features = [
  {
    title: "Instant Scheduling",
    description: "Book appointments in seconds with our optimized, high-performance calendar engine.",
    icon: "⚡"
  },
  {
    title: "Client Management",
    description: "Keep track of every client interaction and history in a beautiful, organized database.",
    icon: "👥"
  },
  {
    title: "Cloud Sync",
    description: "Access your data from anywhere. Real-time synchronization across all your devices.",
    icon: "☁️"
  },
  {
    title: "Smart Analytics",
    description: "Gain deep insights into your business performance with automated reporting.",
    icon: "📊"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-bold gradient-text">Everything you need to scale</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Powerful tools designed for growth, built to be as simple as they are beautiful.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div 
            key={idx} 
            className="group p-8 rounded-3xl glass hover:bg-white/[0.05] transition-all border border-white/5 hover:border-blue-500/50 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="text-4xl mb-6">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
