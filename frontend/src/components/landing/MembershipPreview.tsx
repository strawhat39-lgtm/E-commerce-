'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const tiers = [
  {
    name: 'Bronze',
    scoreReq: '0 - 500',
    color: 'accent-orange',
    glow: 'rgba(255,107,53,',
    benefits: [
      'Basic product passport access',
      'Standard transaction fees',
      'Marketplace buying & selling'
    ]
  },
  {
    name: 'Silver',
    scoreReq: '500 - 2,000',
    color: 'accent-teal',
    glow: 'rgba(13,255,198,',
    benefits: [
      '5% discount on eco-products',
      'Priority listing placement',
      'Advanced impact analytics'
    ]
  },
  {
    name: 'Gold',
    scoreReq: '2,000+',
    color: 'neon-green',
    glow: 'rgba(57,255,20,',
    benefits: [
      '15% discount on all purchases',
      'Zero transaction fees',
      '24hr early access to drops',
      'Exclusive VIP community events'
    ],
    popular: true
  }
];

export default function MembershipPreview() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-accent-purple mb-4 px-4 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/30 shadow-[0_0_15px_rgba(191,90,242,0.2)]">
            Elite Rewards
          </span>
          <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            Your Impact. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-teal">Your Status.</span>
          </h2>
          <p className="text-muted mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Every eco-friendly action builds your Activity Score. Higher scores unlock exclusive tiers, permanent discounts, and special platform privileges.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={`relative glass rounded-3xl p-8 border ${tier.popular ? 'border-neon-green/40 shadow-[0_0_40px_rgba(57,255,20,0.15)] scale-105' : 'border-white/10'} group hover:-translate-y-2 transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon-green text-black text-[10px] font-heading font-black tracking-widest px-4 py-1.5 rounded-full uppercase shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                  Most Elite
                </div>
              )}
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"
                style={{ background: `radial-gradient(circle at top right, ${tier.glow}1), transparent 70%)` }}
              />

              <h3 className="font-heading text-3xl font-black text-white relative z-10">{tier.name}</h3>
              <div className="mt-2 mb-8 relative z-10">
                <span className="text-sm text-muted-dim">Required Score: </span>
                <span className="font-heading tracking-widest font-bold" style={{ color: `${tier.glow}1)` }}>{tier.scoreReq}</span>
              </div>

              <ul className="space-y-4 mb-8 relative z-10">
                {tier.benefits.map((benefit, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: `${tier.glow}1)` }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block w-full text-center py-4 rounded-xl font-heading text-sm font-bold tracking-widest uppercase transition-all duration-300 relative z-10 ${
                  tier.popular 
                    ? 'bg-neon-green text-black hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]' 
                    : 'glass border border-white/20 text-white hover:bg-white/5'
                }`}
              >
                Join {tier.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
