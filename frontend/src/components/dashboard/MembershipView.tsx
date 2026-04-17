'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { useState } from 'react';
import { fetchFromApi } from '@/utils/api';

interface MembershipViewProps {
  user: User;
}

export default function MembershipView({ user }: MembershipViewProps) {
  const derivedTier = user.score >= 2000 ? 'gold' : user.score >= 500 ? 'silver' : 'bronze';
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'intent' | 'pass'>('intent');

  const actualTier = activeOverride || user.membershipTier || derivedTier;

  const handleUpgradeClick = async (tierId: string) => {
    setSelectedTier(tierId);
    setIsModalOpen(true);
    setStep('intent');
    setQrCode(null);
    setIsProcessing(true);

    try {
      const response = await fetchFromApi('/membership/intent', {
        method: 'POST',
        body: JSON.stringify({ tier: tierId })
      });
      if (response && response.qrDataUrl) {
        setQrCode(response.qrDataUrl);
      }
    } catch (e) {
      console.error('Failed to grab intent', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetchFromApi('/membership/confirm', {
        method: 'POST',
        body: JSON.stringify({ tier: selectedTier })
      });
      if (response && response.passDataUrl) {
        setQrCode(response.passDataUrl);
        setStep('pass');
        setActiveOverride(selectedTier); // instantly upgrade UI via local state
      }
    } catch (e) {
      console.error('Checkout failed', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze 🌱',
      threshold: 0,
      discount: '5%',
      benefits: ['Standard Eco Marketplace', '5% Off Buy Mode', 'Basic Activity Tracking'],
      color: '#CD7F32'
    },
    {
      id: 'silver',
      name: 'Silver 🌿',
      threshold: 500,
      discount: '15%',
      benefits: ['15% Off Buy Mode', 'Unlock Early Access (Silver items)', 'Premium Badges'],
      color: '#C0C0C0'
    },
    {
      id: 'gold',
      name: 'Gold 🌳',
      threshold: 2000,
      discount: '25%',
      benefits: ['25% Off Buy Mode', 'Unlock ALL Early Access', 'Priority Support', 'Exclusive Local Rewards'],
      color: '#FFD700'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="font-heading text-3xl font-bold">Reuse_mart Memberships</h2>
        <p className="text-muted text-sm leading-relaxed">
          Your sustainability score unlocks powerful ecosystem benefits. Track your carbon savings, rescue more food, and earn higher tiers for better discounts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => {
          const isActive = actualTier === tier.id;
          const isPointLocked = user.score < tier.threshold;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative glass rounded-3xl p-8 overflow-hidden transition-all duration-300 ${
                isActive ? 'scale-105 border border-white/20 z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'opacity-80 scale-100 hover:opacity-100'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${tier.color}, transparent)` }}
                />
              )}
              
              <div className="relative z-10">
                {isActive && (
                  <div className="inline-block px-3 py-1 bg-neon-green/10 text-neon-green text-[10px] font-heading font-bold tracking-widest uppercase rounded-full border border-neon-green/20 mb-4">
                    Current Tier
                  </div>
                )}
                
                <h3 className="font-heading text-2xl font-bold mb-1" style={{ color: isActive ? tier.color : 'white' }}>{tier.name}</h3>
                <p className="text-xs text-muted-dim font-bold tracking-wider uppercase mb-6">
                  {tier.threshold} Points Required
                </p>

                <div className="flex items-end gap-2 mb-8">
                  <span className="font-heading text-4xl font-bold">{tier.discount}</span>
                  <span className="text-sm tracking-wider text-muted-dim mb-1 font-bold">DISCOUNT</span>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.benefits.map((benefit, i) => (
                    <div key={i} className="flex flex-start gap-3">
                      <span className="mt-0.5 text-xs text-neon-green">✓</span>
                      <span className="text-sm text-muted">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  disabled={isActive}
                  onClick={() => !isActive && handleUpgradeClick(tier.id)}
                  className={`w-full py-3 rounded-xl font-heading font-bold tracking-wider uppercase text-xs transition-all ${
                    isActive 
                      ? 'bg-surface-mid text-white border border-white/10 cursor-default' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isActive ? 'Active' : isPointLocked ? `Pay to Unlock` : 'Upgrade Available'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass max-w-2xl mx-auto rounded-2xl p-6 relative overflow-hidden">
        <div className="flex justify-between text-xs font-heading tracking-widest uppercase text-muted-dim mb-2">
           <span>Current Score: <strong className="text-white">{user.score}</strong></span>
           <span>Next Tier: <strong className="text-accent-gold">Platinum (5000)</strong></span>
        </div>
        <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-green via-accent-teal to-accent-gold" style={{ width: `${(user.score / 5000) * 100}%` }} />
        </div>
      </motion.div>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass max-w-sm w-full rounded-2xl p-8 border border-white/10 shadow-[0_0_50px_rgba(57,255,20,0.1)] relative text-center"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-white"
              >
                ✕
              </button>
              
              <h3 className="font-heading text-xl font-bold mb-4">
                {step === 'intent' ? 'Unlock with UPI' : 'Digital ECO_PASS'}
              </h3>
              
              <div className="bg-white rounded-xl inline-block mb-6 shadow-inner mx-auto w-48 h-48 flex items-center justify-center overflow-hidden">
                {isProcessing && !qrCode ? (
                  <div className="animate-spin w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full" />
                ) : qrCode ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrCode} alt="QR Payload" className="w-full h-full object-contain mix-blend-multiply p-2" />
                ) : (
                   <p className="text-gray-400 text-sm font-heading tracking-widest font-bold">FAILED</p>
                )}
              </div>

              {step === 'intent' ? (
                <>
                  <p className="text-sm text-muted-dim tracking-wider uppercase font-bold mb-6">Scan to bypass points and instantly upgrade to {selectedTier}</p>
                  <button 
                    onClick={simulateCheckout}
                    disabled={isProcessing || !qrCode}
                    className="w-full py-3 bg-neon-green text-black rounded-lg font-bold font-heading uppercase tracking-widest hover:bg-neon-green/90 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying...' : 'Simulate Payment'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-neon-green tracking-wider uppercase font-bold mb-6">Payment Secured.</p>
                  <p className="text-xs text-muted leading-relaxed">Save this QR pass locally. It proves your elite Reuse_mart rank at all physical scanning kiosks.</p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 mt-4 glass text-white rounded-lg font-bold font-heading uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
