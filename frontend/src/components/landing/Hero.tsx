'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Interactive Glow */}
      <motion.div
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 0.5 }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-neon-green/5 blur-[120px]" />
        <div className="absolute top-1/4 left-1/3 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full bg-accent-teal/10 blur-[150px]" />
      </motion.div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Content Layout */}
      <div className="section-container relative z-10 w-full pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8 max-w-2xl"
          >
            {/* Super Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-green/30 w-fit backdrop-blur-md shadow-[0_0_20px_rgba(57,255,20,0.1)]"
            >
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
              </div>
              <span className="text-xs font-heading font-bold tracking-widest text-neon-green uppercase drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
                Next-Gen Circular Platform
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight">
              Track. Trade.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-accent-teal to-neon-green bg-[length:200%_auto] animate-[gradient-x_3s_ease_infinite] drop-shadow-[0_0_15px_rgba(57,255,20,0.4)] relative">
                Transform
              </span>
              <br />
              <span className="text-white/90">Sustainability.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg text-muted-dim leading-relaxed max-w-xl font-medium border-l-2 border-white/10 pl-6">
              A premium marketplace where every action counts. Scan products, upcycle goods, and earn elite membership rewards through high-impact eco-habits.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-5 pt-4">
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-3 px-8 py-4 font-heading text-sm font-bold tracking-widest uppercase bg-neon-green text-black rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                </span>
              </Link>

              <button
                className="group inline-flex items-center gap-3 px-8 py-4 font-heading text-sm font-bold tracking-widest uppercase text-white glass border border-white/10 rounded-xl hover:border-accent-teal/50 transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-teal group-hover:scale-110 transition-transform">
                  <path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4z"/>
                  <path d="M12 4v16M4 12h16"/>
                </svg>
                Scan Product
              </button>
            </div>
          </motion.div>

          {/* Right Visual - Interactive Floating 3D Object Mock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative hidden lg:flex items-center justify-center min-h-[500px]"
          >
            {/* Central glowing core container */}
            <motion.div 
              animate={{ 
                rotateX: mousePosition.y * 15,
                rotateY: mousePosition.x * 15 
              }}
              style={{ perspective: 1000 }}
              className="relative w-full aspect-square max-w-[500px] flex items-center justify-center transform-gpu"
            >
              {/* Spinning rings representing circular economy */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-neon-green/20 border-dashed"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="absolute inset-8 rounded-full border-2 border-accent-teal/10 border-dotted"
              />
              
              {/* Geometric Core Object */}
              <div className="relative w-64 h-64">
                <motion.div 
                  animate={{ y: [-10, 10, -10], rotateZ: [0, 5, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-neon-green/30 to-accent-purple/30 rounded-3xl blur-[20px]"
                />
                <motion.div 
                  animate={{ y: [-10, 10, -10], rotateZ: [0, 5, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute inset-0 glass rounded-3xl border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(57,255,20,0.15)] overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(57,255,20,0.2),transparent_50%)]" />
                  <span className="text-7xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 relative z-10">
                    Eco
                  </span>
                </motion.div>
                
                {/* Floating elements around the core */}
                {[
                  { label: "SELL", offset: "-top-6 -right-6", delay: 0 },
                  { label: "BUY", offset: "top-1/2 -left-12", delay: 1 },
                  { label: "EARN", offset: "-bottom-8 right-10", delay: 2 }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ repeat: Infinity, duration: 4, delay: item.delay, ease: "easeInOut" }}
                    className={`absolute ${item.offset} z-20 glass px-4 py-2 rounded-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md`}
                  >
                    <span className="text-xs font-heading font-black tracking-widest text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
