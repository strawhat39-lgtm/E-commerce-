'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ProblemStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pollutionOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [1, 1, 0]);
  const pollutionY = useTransform(scrollYProgress, [0.2, 0.6], [0, -50]);
  
  const solutionOpacity = useTransform(scrollYProgress, [0.4, 0.6, 0.8], [0, 1, 1]);
  const solutionY = useTransform(scrollYProgress, [0.4, 0.6], [50, 0]);
  const solutionScale = useTransform(scrollYProgress, [0.4, 0.6], [0.9, 1]);

  return (
    <section ref={containerRef} className="relative min-h-[150vh] flex items-center justify-center py-24">
      {/* Background gradients for pollution/solution transition */}
      <motion.div 
        style={{ opacity: pollutionOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-accent-red/5 to-transparent pointer-events-none" 
      />
      <motion.div 
        style={{ opacity: solutionOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-green/5 pointer-events-none" 
      />

      <div className="section-container relative w-full mt-[-20vh]">
        {/* Pollution Section */}
        <motion.div
          style={{ opacity: pollutionOpacity, y: pollutionY, pointerEvents: 'none' }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-accent-red mb-4 px-4 py-1 rounded-full glass border border-accent-red/20 shadow-[0_0_15px_rgba(255,77,77,0.2)]">
            The Reality
          </span>
          <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 leading-tight drop-shadow-[0_0_10px_rgba(255,77,77,0.3)]">
            <span className="text-accent-red/90">2.12 billion tons</span> of waste<br/>end up in landfills every year.
          </h2>
          <p className="text-lg text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            While perfectly good items go unused, edible food rots, and valuable materials are buried. The linear economy is completely broken.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
            {[
              { stat: '40%', label: 'of food is wasted', color: '#FF6B35' },
              { stat: '92M', label: 'tons of textile waste', color: '#FF4D4D' },
              { stat: '50M', label: 'tons of e-waste', color: '#BF5AF2' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 border-t border-accent-red/10 shadow-[0_10px_30px_rgba(255,77,77,0.05)]">
                <span className="font-heading text-4xl font-black block" style={{ color: item.color }}>
                  {item.stat}
                </span>
                <span className="text-xs font-semibold tracking-wider text-muted-dim uppercase mt-3 block">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Solution Section */}
        <motion.div
          style={{ opacity: solutionOpacity, y: solutionY, scale: solutionScale }}
          className="relative z-10 flex flex-col items-center justify-center text-center"
        >
          <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-neon-green mb-4 px-4 py-1 rounded-full glass border border-neon-green/20 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            The Solution
          </span>
          <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 leading-tight drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-accent-teal">Circular Economy</span>
          </h2>
          <p className="text-lg text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            We are flipping the system. By actively rewarding reuse, responsible reselling, and sustainable choices, we turn waste back into wealth.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
            {[
              { title: 'Track Carbon', icon: '🌍', desc: 'See the exact impact of every transaction.' },
              { title: 'Trade Smart', icon: '♻️', desc: 'Buy and sell refurbished or upcycled goods.' },
              { title: 'Earn Elite Status', icon: '💎', desc: 'Unlock gold tiers simply by saving the planet.' },
            ].map((item, i) => (
               <div key={i} className="glass rounded-2xl p-8 border border-neon-green/10 hover:border-neon-green/30 transition-colors shadow-[inset_0_0_20px_rgba(57,255,20,0.02)] group hover:-translate-y-1 duration-300">
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                 <h3 className="font-heading text-lg font-bold text-white mb-2">{item.title}</h3>
                 <p className="text-sm text-muted-dim leading-relaxed">{item.desc}</p>
               </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
