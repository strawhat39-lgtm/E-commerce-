'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(57,255,20,0.05),transparent_50%)] pointer-events-none" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[2.5rem] overflow-hidden glass border border-neon-green/20 shadow-[0_0_50px_rgba(57,255,20,0.05)]"
        >
          {/* Animated beam over the top border */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden">
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-neon-green to-transparent"
            />
          </div>

          <div className="relative z-10 px-8 py-24 lg:px-16 lg:py-32 text-center backdrop-blur-xl">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/50 border border-neon-green/30 text-xs font-heading font-black tracking-[0.2em] text-neon-green uppercase mb-8 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              The Future is Circular
            </motion.span>

            <h2 className="font-heading text-5xl lg:text-7xl font-bold max-w-4xl mx-auto leading-[1.1] tracking-tight drop-shadow-2xl">
              Stop Wasting.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-accent-teal to-neon-green bg-[length:200%_auto] animate-[gradient-x_3s_ease_infinite]">
                Start Earning.
              </span>
            </h2>

            <p className="text-muted-dim text-lg mt-8 max-w-2xl mx-auto leading-relaxed border-l-2 border-neon-green/20 pl-6">
              Join thousands of forward-thinking consumers turning their eco-friendly choices into verifiable real-world value.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12">
              <Link
                href="/login"
                className="group relative inline-flex justify-center items-center gap-3 w-full sm:w-auto px-10 py-5 font-heading text-sm font-black tracking-[0.1em] uppercase bg-neon-green text-black rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_50px_rgba(57,255,20,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Join the Circular Economy</span>
              </Link>
              
              <Link
                href="/marketplace"
                className="group inline-flex justify-center items-center w-full sm:w-auto px-10 py-5 font-heading text-sm font-bold tracking-[0.1em] uppercase text-white glass border border-white/10 rounded-2xl hover:border-accent-teal/50 hover:bg-white/5 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-muted-dim text-xs font-heading font-medium tracking-[0.15em] uppercase">
              <span className="flex items-center gap-2">
                <span className="text-neon-green">✓</span> Verified Impact
              </span>
              <span className="flex items-center gap-2">
                <span className="text-accent-teal">✓</span> Secure Blockchain
              </span>
              <span className="flex items-center gap-2">
                <span className="text-accent-purple">✓</span> Premium Rewards
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
