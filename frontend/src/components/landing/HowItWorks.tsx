'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ step, index }: { step: any, index: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.15 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative h-[400px] w-full rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-neon-green/80 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] bg-surface-base"
    >
      <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
        <img 
          src={step.bg} 
          alt={step.title} 
          className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-700 ease-out group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
      </div>

      <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end transform-gpu pointer-events-none" style={{ transform: "translateZ(50px)" }}>
        <span className="text-5xl mb-6 block transform-gpu drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" style={{ transform: "translateZ(80px)" }}>
          {step.icon}
        </span>
        <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3 text-white transform-gpu" style={{ transform: "translateZ(60px)" }}>
          {step.title}
        </h3>
        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans transform-gpu" style={{ transform: "translateZ(40px)" }}>
          {step.desc}
        </p>
      </div>
      
      {/* Dynamic green glow hover layer */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_50%_100%,#39FF14,transparent_70%)] transition-opacity duration-500 mix-blend-screen" />
    </motion.div>
  );
};

export default function HowItWorks() {
  const steps = [
    {
      icon: '🌍',
      title: 'Track Impact',
      desc: 'Understand the carbon footprint of your purchases',
      bg: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    },
    {
      icon: '🤝',
      title: 'Trade Smart',
      desc: 'Rent, swap, and reuse items within your community',
      bg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
    },
    {
      icon: '♻️',
      title: 'Reduce Waste',
      desc: 'Give products a second life through circular economy',
      bg: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(57,255,20,0.05),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 perspective-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-heading font-bold tracking-[4px] uppercase text-neon-green mb-4 px-4 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30">
            About Reuse_Mart
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-extrabold mt-4 text-white">
            How Reuse_Mart Works
          </h2>
          <p className="mt-6 text-muted font-sans text-lg lg:text-xl max-w-2xl mx-auto tracking-wide">
            A smarter way to shop, trade, and reduce waste.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 perspective-[1000px]">
          {steps.map((step, i) => (
            <TiltCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
