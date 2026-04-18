'use client';

import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particles: { x: number; y: number; life: number; size: number }[] = [];
    let mouse = { x: 0, y: 0, isActive: false };
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
      
      // Throttle particle creation slightly to avoid overpopulation
      if (Math.random() > 0.3) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          life: 1.0,
          size: Math.random() * 4 + 2 // Initial size between 2px and 6px
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        // Neon green fill style with fading opacity based on life
        ctx.fillStyle = `rgba(34, 197, 94, ${p.life})`;
        // Slight glowing blur
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(34, 197, 94, ${p.life * 0.8})`;
        
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        // Animate particles
        p.life -= 0.04; // Fade speed
        // Slight curved floating motion (drifting downwards and sideways)
        p.x += (Math.random() - 0.5) * 1.5;
        p.y += (Math.random() - 0.5) * 1.5;
      }

      // Remove dead particles
      particles = particles.filter((p) => p.life > 0);

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[10000]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
