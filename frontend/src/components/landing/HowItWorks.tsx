'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    icon: '📦',
    title: 'List or Discover',
    desc: 'Post items to swap, rent, or find surplus food and upcycling materials near you.',
    color: 'from-neon-green/20 to-transparent',
    border: 'border-neon-green/20',
  },
  {
    num: '02',
    icon: '🤝',
    title: 'Connect & Exchange',
    desc: 'Match with neighbors, shelters, and creators. Every exchange diverts waste from landfills.',
    color: 'from-accent-teal/20 to-transparent',
    border: 'border-accent-teal/20',
  },
  {
    num: '03',
    icon: '📊',
    title: 'Track Your Impact',
    desc: 'See your CO₂ savings, earn badges, climb the leaderboard, and unlock local rewards.',
    color: 'from-accent-gold/20 to-transparent',
    border: 'border-accent-gold/20',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-mid/50 to-transparent pointer-events-none" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-neon-green mb-4 px-4 py-1 rounded-full bg-neon-green/8 border border-neon-green/20">
            How It Works
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold mt-4">
            Three Steps to <span className="gradient-text">Zero Waste</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15 }}
              className={`glass-hover rounded-2xl p-8 relative overflow-hidden group`}
            >
              {/* Number */}
              <span className="absolute top-6 right-6 font-heading text-6xl font-bold text-white/[0.03] group-hover:text-white/[0.06] transition-colors">
                {step.num}
              </span>

              {/* Gradient glow */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${step.color}`} />

              <div className="relative z-10">
                <span className="text-3xl mb-5 block">{step.icon}</span>
                <h3 className="font-heading text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection line */}
        <div className="hidden md:block relative mt-[-160px] mb-[80px] pointer-events-none">
          <div className="absolute left-[16.67%] right-[16.67%] top-1/2 h-px">
            <div className="h-full bg-gradient-to-r from-neon-green/20 via-accent-teal/20 to-accent-gold/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
