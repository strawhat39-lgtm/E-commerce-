'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from '../common/Logo';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(1);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, s: number }[]>([]);

  useEffect(() => {
    // Generate scattered particles
    const arr = Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 250 + 100;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        s: Math.random() * 3 + 1,
      };
    });
    setParticles(arr);

    const handleLoad = () => {
      // Phase 1: Particles collapsing (0 -> 1000ms)
      setTimeout(() => setPhase(2), 1000); // Phase 2: Logo reveal & Pulse
      setTimeout(() => setPhase(3), 2200); // Phase 3: Energy Burst
      setTimeout(() => setLoading(false), 2600); // Trigger exit
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Phase 3: Energy Burst Expansion */}
          {phase === 3 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 15, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-neon-green/30 rounded-full blur-2xl pointer-events-none"
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Phase 1: Particle Build */}
            {phase === 1 && (
              <div className="relative w-32 h-32 flex items-center justify-center">
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0, p.s, 0] }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#39FF14]"
                  />
                ))}
              </div>
            )}

            {/* Phase 2: Logo Reveal */}
            {(phase === 2 || phase === 3) && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ 
                  scale: phase === 3 ? 1.2 : [1, 1.02, 1], 
                  opacity: phase === 3 ? 0 : 1,
                  rotate: 0,
                  filter: [
                    "drop-shadow(0px 0px 10px rgba(57,255,20,0.2))",
                    "drop-shadow(0px 0px 30px rgba(57,255,20,0.5))",
                    "drop-shadow(0px 0px 10px rgba(57,255,20,0.2))"
                  ]
                }}
                transition={{ 
                  scale: { duration: phase === 3 ? 0.8 : 3, repeat: phase === 3 ? 0 : Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5, ease: "easeInOut" },
                  rotate: { type: "spring", stiffness: 100, damping: 20 },
                  filter: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative"
              >
                <Logo hideText className="scale-[2] transform-gpu mb-8" />
                
                {/* Subtle outer eco ring overlay */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="absolute -inset-10 rounded-full border border-dashed border-neon-green/30"
                />
              </motion.div>
            )}

            {/* Text loading hook */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: (phase === 2) ? 1 : 0, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-48 flex flex-col items-center gap-2 whitespace-nowrap"
            >
              <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                Reuse<span className="text-neon-green">_Mart</span>
              </h2>
              <span className="text-xs md:text-sm font-heading tracking-widest text-[#39FF14] opacity-90">
                Initializing Circular Economy...
              </span>
            </motion.div>
          </div>

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
