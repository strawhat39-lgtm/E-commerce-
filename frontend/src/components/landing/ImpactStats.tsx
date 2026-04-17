'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const stats = [
  { value: 128.5, suffix: 'kg', label: 'CO₂ Saved', icon: '🌱', color: '#39FF14' },
  { value: 8456, suffix: '', label: 'Transactions', icon: '🔄', color: '#0DFFC6' },
  { value: 2847, suffix: '', label: 'Active Users', icon: '👥', color: '#BF5AF2' },
  { value: 1243, suffix: '', label: 'Items Listed', icon: '📦', color: '#FFD700' },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  const formatted = target >= 1000
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  return <>{formatted}{suffix}</>;
}

export default function ImpactStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/[0.02] to-transparent pointer-events-none" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-4xl lg:text-5xl font-bold">
            Real Impact, <span className="gradient-text-warm">Real Numbers</span>
          </h2>
          <p className="text-muted mt-3">Our community&apos;s collective impact, updated in real time.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center group hover:border-white/10 transition-all duration-300"
            >
              <span className="text-3xl block mb-3">{stat.icon}</span>
              <span
                className="font-heading text-3xl lg:text-4xl font-bold block"
                style={{ color: stat.color }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
              </span>
              <span className="text-xs font-heading tracking-widest uppercase text-muted-dim mt-2 block">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
