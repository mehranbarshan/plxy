
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import en from '@/locales/en.json';
import fa from '@/locales/fa.json';

const translations = { en, fa };

type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('tradeview_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fa')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('tradeview_language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, values?: Record<string, string | number>): string => {
    const langFile = translations[language] as { [key: string]: any };
    const keys = key.split('.');
    let result: any = langFile;

    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            return key; 
        }
    }

    if (typeof result === 'string' && values) {
      return result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = values[key];
        if (typeof value === 'number') {
            return formatNumber(value);
        }
        return value?.toString() || match;
      });
    }

    return result || key;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US', { 
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: 20 
    }).format(num);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
