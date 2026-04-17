'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial heavy asset loading or network ping
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#09090b]"
        >
          <div className="text-center relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-neon-green/20 blur-[50px] rounded-full"
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-6 animate-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              
              <h1 className="font-heading font-bold text-3xl tracking-widest uppercase">
                REUSE<span className="text-neon-green text-glow-green">_MART</span>
              </h1>
              
              <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-1/2 h-full bg-neon-green rounded-full shadow-[0_0_10px_#39FF14]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
