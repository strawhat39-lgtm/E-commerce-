'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'kn';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    kn: string;
  };
}

// System Dictionary
const dict: Translations = {
  // Navigation
  nav_home: { en: 'Home', hi: 'होम', kn: 'ಮನೆ' },
  nav_market: { en: 'Marketplace', hi: 'बाज़ार', kn: 'ಮಾರುಕಟ್ಟೆ' },
  nav_dash: { en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  nav_list: { en: 'List Item', hi: 'सूची आइटम', kn: 'ಪಟ್ಟಿ ಐಟಂ' },
  
  // Dashboard Tabs
  tab_overview: { en: 'overview', hi: 'अवलोकन', kn: 'ಅವಲೋಕನ' },
  tab_buy: { en: 'buy', hi: 'खरीदें', kn: 'ಖರೀದಿಸಿ' },
  tab_sell: { en: 'sell', hi: 'बेचें', kn: 'ಮಾರಿ' },
  tab_membership: { en: 'membership', hi: 'सदस्यता', kn: 'ಸದಸ್ಯತ್ವ' },
  
  // Dashboard Core
  dash_welcome: { en: 'Welcome', hi: 'स्वागत है', kn: 'ಸ್ವಾಗತ' },
  dash_signout: { en: 'Sign Out', hi: 'साइन आउट', kn: 'ಸೈನ್ ಔಟ್' },
  
  // Memberships
  mem_title: { en: 'Reuse_mart Memberships', hi: 'Reuse_mart सदस्यताएँ', kn: 'Reuse_mart ಸದಸ್ಯತ್ವಗಳು' },
  mem_subtitle: { en: 'Track carbon savings and earn tiers.', hi: 'कार्बन बचत ट्रैक करें और टियर कमाएं।', kn: 'ಕಾರ್ಬನ್ ಉಳಿತಾಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.' },
  mem_current: { en: 'Current Tier', hi: 'वर्तमान स्तर', kn: 'ಪ್ರಸ್ತುತ ಹಂತ' },
  mem_upgrade: { en: 'Upgrade Available', hi: 'अपग्रेड उपलब्ध', kn: 'ಅಪ್‌ಗ್ರೇಡ್ ಲಭ್ಯವಿದೆ' },
  mem_active: { en: 'Active', hi: 'सक्रिय', kn: 'ಸಕ್ರಿಯ' },
  
  // Buttons
  btn_add_cart: { en: 'Add to Cart', hi: 'कार्ट में डालें', kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' },
  btn_buy_now: { en: 'Buy Now', hi: 'अभी खरीदें', kn: 'ಈಗ ಖರೀದಿಸಿ' },
  btn_checkout: { en: 'Proceed to Checkout', hi: 'चेकआउट के लिए आगे बढ़ें', kn: 'ಚೆಕ್ಔಟ್ಗೆ ಮುಂದುವರಿಯಿರಿ' }
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k, f) => f || k,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reuse_mart_lang');
    if (saved && ['en', 'hi', 'kn'].includes(saved)) {
      setLang(saved as Language);
    }
    setIsMounted(true);
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('reuse_mart_lang', l);
  };

  const t = (key: string, fallback?: string) => {
    if (dict[key]) {
      return dict[key][lang];
    }
    return fallback || key; // Return fallback or the key itself
  };

  // Prevent server hydration mismatch on textual rendering by waiting
  if (!isMounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
