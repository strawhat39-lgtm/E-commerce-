'use client';

import { useState, useEffect } from 'react';
import { fetchFromApi } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  metrics: {
    co2Saved: number | string;
    itemsReused: number | string;
    foodRescued: number | string;
    wasteDiverted: number | string;
  };
}

export default function DashboardAIInsights({ metrics }: AIInsightsProps) {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateInsight();
  }, [metrics.co2Saved, metrics.itemsReused, metrics.foodRescued, metrics.wasteDiverted]);

  const generateInsight = async () => {
    // Prevent unneeded processing if metrics are effectively 0
    if (Number(metrics.co2Saved) === 0 && Number(metrics.itemsReused) === 0 && Number(metrics.foodRescued) === 0) {
      setInsight("You haven't completed any eco-transactions yet! Try swapping an item or rescuing food to see your environmental impact grow. 🌱");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        message: `Analyze my metrics deeply and briefly: CO2 Saved: ${metrics.co2Saved}kg, Items Reused: ${metrics.itemsReused}, Food Rescued: ${metrics.foodRescued}, Waste Diverted: ${metrics.wasteDiverted}kg. Give me ONE specific, highly encouraging tip for what my next eco-friendly step should be based strictly on these numbers. Keep it to exactly two sentences. Do NOT include redirects.`,
        history: [], 
        userId: session?.user?.id || 'anonymous',
      };

      const res = await fetchFromApi('/chat', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.reply) {
        setInsight(res.reply);
      } else {
        throw new Error("Invalid neural response");
      }
    } catch (e) {
      console.error("Dashboard AI Generation Error:", e);
      setInsight("The neural network is calculating your impact trajectory... (Please ensure GEMINI_API_KEY is configured).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5 border border-neon-green/20 relative overflow-hidden mb-8"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h3 className="font-heading font-bold text-sm tracking-widest uppercase flex items-center gap-2">
          <span className="text-neon-green text-lg">🧠</span>
          AI Sustainability Insights
        </h3>
        <button 
          onClick={generateInsight} 
          disabled={isLoading}
          className="text-[10px] text-muted-dim hover:text-neon-green tracking-widest uppercase disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {isLoading ? 'Scanning...' : '⟳ Refresh'}
        </button>
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neon-green/70">
             <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" />
             <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: '0.2s' }} />
             <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: '0.4s' }} />
             Processing neural insights...
          </div>
        ) : (
          <p className="text-sm font-body text-white/90 leading-relaxed">
            {insight}
          </p>
        )}
      </div>
    </motion.div>
  );
}
