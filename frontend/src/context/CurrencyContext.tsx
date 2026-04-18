'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const EXCHANGE_RATE = 83; // 1 USD = 83 INR

type CurrencyType = 'INR' | 'USD';

interface CurrencyContextProps {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (amountInINR: number | string | undefined | null) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>('INR');

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('reuse_mart_currency') as CurrencyType;
    if (saved === 'USD' || saved === 'INR') {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem('reuse_mart_currency', c);
  };

  const formatPrice = (amountInINR: number | string | undefined | null) => {
    if (amountInINR === undefined || amountInINR === null) return '';
    const amount = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/[^0-9.-]+/g, '')) : amountInINR;
    if (isNaN(amount)) return typeof amountInINR === 'string' ? amountInINR : '';

    if (currency === 'USD') {
      const converted = amount / EXCHANGE_RATE;
      return `$${converted.toFixed(2)}`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
