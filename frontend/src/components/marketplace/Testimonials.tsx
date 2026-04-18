import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    avatar: '👩🏽‍🦱',
    review: 'Rented a power drill for the weekend instead of buying one. Saved me $120 and zero waste!',
    rating: 5,
  },
  {
    id: 2,
    name: 'David Chen',
    avatar: '👨🏻‍💻',
    review: 'Traded my old mountain bike for an acoustic guitar. The neighborhood swap was super easy.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Maria Garcia',
    avatar: '👩🏻',
    review: 'Found an amazing vintage lamp. Better than buying new and paying for shipping emissions!',
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 mt-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-low/50 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold tracking-wide">Community Impact</h2>
          <p className="text-muted mt-2">See how neighbors are saving money and the planet.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-surface-mid/50 border border-white/5 rounded-2xl p-6 glass-hover"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-surface-high rounded-full flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-heading font-semibold tracking-wide text-sm">{t.name}</h4>
                  <div className="flex gap-1 text-accent-gold text-xs mt-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={idx < t.rating ? 'opacity-100' : 'opacity-30'}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-dim text-sm italic leading-relaxed">
                "{t.review}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
