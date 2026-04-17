'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const navKeys = [
  { href: '/', labelKey: 'nav_home' },
  { href: '/marketplace', labelKey: 'nav_market' },
  { href: '/dashboard', labelKey: 'nav_dash' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#09090b]/85 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-heading font-bold text-lg tracking-wider uppercase">
            REUSE<span className="text-neon-green text-glow-green">_MART</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navKeys.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                pathname === link.href
                  ? 'text-neon-green'
                  : 'text-muted hover:text-white'
              }`}
            >
              {t(link.labelKey)}
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-neon-green rounded-full"
                  style={{ boxShadow: '0 0 10px rgba(57,255,20,0.5)' }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA + Language Toggle + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-surface-high/50 text-white text-xs border border-white/10 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-neon-green/50 transition-colors"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="kn">ಕನ್ನಡ (KN)</option>
          </select>

          <Link
            href="/marketplace"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-heading font-semibold tracking-widest uppercase bg-neon-green text-black rounded-lg hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            {t('nav_list')}
          </Link>

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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-low/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navKeys.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'text-neon-green bg-neon-green/5'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
