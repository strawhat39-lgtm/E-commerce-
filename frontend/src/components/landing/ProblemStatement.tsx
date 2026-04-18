'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProblemStatement() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pollutionOpacity = useTransform(scrollYProgress, [0.0, 0.4], [1, 0]);
  const pollutionY = useTransform(scrollYProgress, [0.0, 0.4], [0, -50]);
  const pollutionScale = useTransform(scrollYProgress, [0.0, 0.4], [1, 0.95]);
  
  const solutionOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  const solutionY = useTransform(scrollYProgress, [0.4, 0.8], [50, 0]);
  const solutionScale = useTransform(scrollYProgress, [0.4, 0.8], [0.95, 1]);

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-background">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background gradients for pollution/solution transition */}
        <motion.div 
          style={{ opacity: pollutionOpacity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,77,77,0.05),transparent_70%)] pointer-events-none" 
        />
        <motion.div 
          style={{ opacity: solutionOpacity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.05),transparent_70%)] pointer-events-none" 
        />

        <div className="section-container relative w-full h-full flex items-center justify-center">
          
          {/* Pollution Section */}
          <motion.div
            style={{ opacity: pollutionOpacity, y: pollutionY, scale: pollutionScale }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-accent-red mb-4 px-4 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 shadow-[0_0_15px_rgba(255,77,77,0.2)]">
              {t('prob_reality_badge')}
            </span>
            <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 leading-tight">
              <span className="text-accent-red/90 drop-shadow-[0_0_10px_rgba(255,77,77,0.3)]">{t('prob_reality_title1')}</span> {t('prob_reality_title2')}
            </h2>
          <p className="text-lg text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            {t('prob_reality_desc')}
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
            {[
              { stat: t('prob_stat1_title'), label: t('prob_stat1_desc'), color: '#FF6B35' },
              { stat: t('prob_stat2_title'), label: t('prob_stat2_desc'), color: '#FF4D4D' },
              { stat: t('prob_stat3_title'), label: t('prob_stat3_desc'), color: '#BF5AF2' },
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
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <span className="inline-block text-xs font-heading font-semibold tracking-[4px] uppercase text-neon-green mb-4 px-4 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              {t('prob_sol_badge')}
            </span>
            <h2 className="font-heading text-4xl lg:text-6xl font-bold mt-4 leading-tight">
              {t('prob_sol_title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-accent-teal drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">{t('prob_sol_title2')}</span>
          </h2>
          <p className="text-lg text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            {t('prob_sol_desc')}
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
            {[
              { title: t('prob_ben1_title'), icon: '🌍', desc: t('prob_ben1_desc') },
              { title: t('prob_ben2_title'), icon: '♻️', desc: t('prob_ben2_desc') },
              { title: t('prob_ben3_title'), icon: '💎', desc: t('prob_ben3_desc') },
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
      </div>
    </section>
  );
}
