'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 translate-y-[-20%]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent-teal/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400"
          >
            The <span className="text-neon-green/90 drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">Circular</span> Economy
          </motion.h1>
          <p className="text-xl md:text-2xl text-muted-dim max-w-3xl mx-auto leading-relaxed">
            Reuse_Mart is a revolutionary digital marketplace engineered strictly for environmental sustainability. Our mission is to fundamentally eliminate excessive consumer waste by empowering localized communities to swap, rent, and sustainably sell goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="glass p-10 rounded-3xl border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-3xl font-heading font-bold mb-4 text-white group-hover:text-neon-green transition-colors">Our Mission</h2>
            <p className="text-muted leading-relaxed">
              Every day, thousands of perfectly functional items are thrown into landfills while others buy them completely brand new. We act as the technical bridge to stop this linear consumption cycle. By providing an elite, high-performance platform for trading, we intend to make sustainable decisions the easiest possible choice.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="glass p-10 rounded-3xl border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-3xl font-heading font-bold mb-4 text-white group-hover:text-accent-teal transition-colors">Carbon Tracking</h2>
            <p className="text-muted leading-relaxed">
              We don't just facilitate sales; we actively compute the environmental metrics! For every transaction processed on our platform, our algorithms calculate the estimated amount of CO₂ emissions you personally prevented from entering the atmosphere compared to buying newly manufactured alternatives.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-heading font-semibold text-neon-green mb-2 tracking-widest uppercase">The Math is Simple</h3>
            <p className="text-3xl font-bold text-white tracking-widest">REDUCE <span className="opacity-50">→</span> REUSE <span className="opacity-50">→</span> REINVENT</p>
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
