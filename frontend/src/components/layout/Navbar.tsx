'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import Logo from '../common/Logo';

import { supabase } from '@/utils/supabase';

const navKeys = [
  { href: '/', labelKey: 'nav_home' },
  { href: '/about', labelKey: 'nav_about' },
  { href: '/marketplace', labelKey: 'nav_market' },
  { href: '/dashboard', labelKey: 'nav_dash', authRequired: true },
  { href: '/wishlist', labelKey: 'nav_wishlist', authRequired: true },
  { href: '/cart', labelKey: 'nav_cart', authRequired: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    
    // Check initial theme
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light') {
        setIsLightMode(true);
        document.documentElement.classList.add('theme-light');
      }
    }
    // Auth state hook
    const updateSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      if (data.session?.user) {
        localStorage.setItem('reuse_mart_current_user', data.session.user.id);
      } else {
        localStorage.removeItem('reuse_mart_current_user');
      }
    };
    updateSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        localStorage.setItem('reuse_mart_current_user', session.user.id);
      } else {
        localStorage.removeItem('reuse_mart_current_user');
      }
    });

    return () => {
       window.removeEventListener('scroll', onScroll);
       authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-gradient-to-b from-background/90 to-transparent'
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navKeys.filter(link => !link.authRequired || isAuthenticated).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredPath(link.href)}
              onMouseLeave={() => setHoveredPath(null)}
              className={`relative px-2 xl:px-4 py-2 text-xs xl:text-sm font-heading font-semibold tracking-widest uppercase transition-colors rounded-lg z-10 whitespace-nowrap ${
                pathname === link.href ? 'text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'text-muted-dim hover:text-white'
              }`}
            >
              {hoveredPath === link.href && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {t(link.labelKey)}
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-neon-green rounded-full shadow-[0_0_10px_rgba(57,255,20,0.8)]"
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA + Actions + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-white/10 glass hover:bg-white/10 transition-colors text-white"
            title="Toggle Light/Dark Mode"
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-surface-high/50 text-foreground text-xs border border-white/10 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-neon-green/50 transition-colors"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="kn">ಕನ್ನಡ (KN)</option>
          </select>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
            className="bg-surface-high/50 text-foreground text-xs border border-white/10 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-neon-green/50 transition-colors"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ['0 0 10px rgba(57,255,20,0.2)', '0 0 25px rgba(57,255,20,0.5)', '0 0 10px rgba(57,255,20,0.2)'] }}
            transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
            onClick={(e) => {
              if (!localStorage.getItem('reuse_mart_current_user')) {
                alert('Please log in first to create listings or explore your items!');
                window.location.href = '/login';
              } else {
                window.location.href = '/dashboard?view=sell';
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-3 xl:px-5 py-2 text-xs font-heading font-bold tracking-widest uppercase bg-neon-green text-black rounded-lg transition-colors border border-transparent hover:border-white/50 whitespace-nowrap flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            {t('nav_list')}
          </motion.button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0, originY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl relative"
          >
            <div className="flex flex-col px-4 pt-2 pb-6 gap-2">
              {navKeys.filter(link => !link.authRequired || isAuthenticated).map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-heading font-semibold tracking-widest uppercase text-sm ${
                      pathname === link.href ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                </motion.div>
              ))}
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setMobileOpen(false);
                  if (!localStorage.getItem('reuse_mart_current_user')) {
                    alert('Please log in first!');
                    window.location.href = '/login';
                  } else {
                    window.location.href = '/dashboard?view=sell';
                  }
                }}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-heading font-bold tracking-widest uppercase bg-neon-green text-black rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.3)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {t('nav_list')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
