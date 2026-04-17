'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    icon: '🏷️',
    title: 'Digital Product Passport',
    desc: 'Every item on the platform is assigned a verifiable eco-score and lifecycle history. Know the true impact of what you own and trade.',
    tag: 'TRANSPARENCY',
    color: 'neon-green',
    href: '/dashboard',
    stats: 'Immutable Tracking',
  },
  {
    icon: '🤝',
    title: 'Buy & Sell Marketplace',
    desc: 'A robust ecosystem to trade, swap, and rescue items. Every successful transaction is tied directly to real-world carbon offset estimates.',
    tag: 'CIRCULARITY',
    color: 'accent-teal',
    href: '/dashboard',
    stats: 'Instant Eco-Savings',
  },
  {
    icon: '💎',
    title: 'Membership Rewards',
    desc: 'Earn points for sustainable actions. Level up from Bronze to Gold to unlock early access, shipping discounts, and exclusive drops.',
    tag: 'GAMIFICATION',
    color: 'accent-purple',
    href: '/dashboard',
    stats: 'Real-World ROI',
  },
];

export default function FeatureModules() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[500px] bg-neon-green/5 blur-[150px] pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-white mb-4 px-4 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            Core Features
          </span>
          <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-accent-teal">Innovation</span>
          </h2>
          <p className="text-muted-dim mt-4 max-w-2xl mx-auto text-lg">
            Stop buying disposable. Start investing in a circular lifecycle that rewards you the greener you get.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const colorMap: Record<string, string> = {
    'neon-green': 'rgba(57,255,20,',
    'accent-teal': 'rgba(13,255,198,',
    'accent-purple': 'rgba(191,90,242,',
  };
  const rgba = colorMap[feature.color] || 'rgba(57,255,20,';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.2, type: 'spring', stiffness: 100 }}
      className="h-full"
    >
      <Link
        href={feature.href}
        className="block glass rounded-3xl p-8 group relative overflow-hidden h-full border border-white/10 hover:border-white/30 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Hover Glow Background */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 100%, ${rgba}1), transparent 70%)` }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${rgba}0.8), transparent)` }}
        />

        {/* Tag */}
        <span
          className="inline-block text-[10px] font-heading font-black tracking-[3px] px-3 py-1.5 rounded-full mb-8 relative z-10"
          style={{
            background: `${rgba}0.15)`,
            color: `${rgba}1)`,
            border: `1px solid ${rgba}0.3)`,
            boxShadow: `0 0 10px ${rgba}0.2)`
          }}
        >
          {feature.tag}
        </span>

        <span className="text-5xl block mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{feature.icon}</span>
        <h3 className="font-heading text-2xl font-bold mb-4 text-white relative z-10">{feature.title}</h3>
        <p className="text-muted-dim leading-relaxed mb-8 relative z-10">{feature.desc}</p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10 relative z-10">
          <span className="text-sm font-heading tracking-widest uppercase text-muted-dim">{feature.stats}</span>
          <span
            className="text-sm font-heading font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300"
            style={{ color: `${rgba}1)` }}
          >
            Explore →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
