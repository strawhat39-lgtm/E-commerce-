'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for the window to finish loading
    const handleLoad = () => {
      // Small artificial delay to show off the beautiful animation smoothly
      setTimeout(() => setIsLoading(false), 800); 
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
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle background glows to match theme */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-neon-green/5 blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-accent-teal/5 blur-[120px]" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex flex-col items-center gap-6 relative z-10"
          >
            {/* The Logo with a majestic pulse hook */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: [
                  "drop-shadow(0px 0px 5px rgba(57,255,20,0.2))",
                  "drop-shadow(0px 0px 20px rgba(57,255,20,0.6))",
                  "drop-shadow(0px 0px 5px rgba(57,255,20,0.2))"
                ]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Logo className="scale-125 md:scale-150" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-4"
            >
              <span className="text-sm font-heading tracking-[0.2em] uppercase text-muted">
                Loading
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                >.</motion.span>
              </span>
            </motion.div>
          </motion.div>

          {/* Grid lines for aesthetic */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
