'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fetchFromApi } from '@/utils/api';
import { supabase } from '@/utils/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! 🌱 I am your Sustainability AI. How can I help you navigate Reuse_Mart or manage your eco-impact today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom logically whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Collect basic frontend metrics to send context
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        message: userMessage,
        history: messages.slice(-5), // send last 5 messages for context
        userId: session?.user?.id || 'anonymous',
      };

      const res = await fetchFromApi('/chat', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res || res.error) throw new Error(res?.error || 'Invalid API Call');
      
      let aiResponse = res.reply || "Sorry, I couldn't process that.";
      
      // Parse for REDIRECT actions
      const redirectMatch = aiResponse.match(/\[REDIRECT:(.*?)\]/);
      if (redirectMatch) {
        const route = redirectMatch[1].trim();
        aiResponse = aiResponse.replace(redirectMatch[0], '').trim();
        if (!aiResponse) aiResponse = `Routing you to ${route}... 🚀`; // Fallback text if prompt was ONLY redirect
        
        // Execute router push asynchronously exactly as designed
        setTimeout(() => router.push(route), 1500); 
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection glitch... unable to reach neural servers right now! 🔌' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 sm:w-96 glass-hover rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col mb-4 max-h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-surface-high/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center text-lg">
                  🤖
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm tracking-widest uppercase">Eco-Assistant</h3>
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white transition-colors">
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-black/40 min-h-[300px]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-neon-green text-black rounded-br-sm' 
                        : 'bg-surface-high border border-white/5 text-white rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-high border border-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-dim animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-dim animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-dim animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Engine */}
            <div className="p-3 border-t border-white/5 bg-surface-high/50 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..." 
                className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-green/50 text-white placeholder-white/30"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green hover:text-black transition-all disabled:opacity-50"
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-neon-green border border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center text-black text-2xl relative overflow-hidden"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
}
