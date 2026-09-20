'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { en } from './en';
import { es } from './es';
import type { Lang, TranslationSchema, I18nContextType } from './types';

const dictionaries: Record<Lang, TranslationSchema> = {
  en,
  es,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialClientLang(fallback: Lang = 'en'): Lang {
  if (typeof window === 'undefined') return fallback;

  // 1. Check cookie
  const match = document.cookie.match(/(?:^|;\s*)venehire_lang=(en|es)(?:;|$)/);
  if (match && (match[1] === 'en' || match[1] === 'es')) {
    return match[1] as Lang;
  }

  // 2. Check navigator.language
  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.toLowerCase().startsWith('es')) {
      return 'es';
    }
  }

  return fallback;
}

// Dev warning proxy for translations
function createTranslationProxy<T extends object>(target: T, lang: Lang, path = ''): T {
  if (process.env.NODE_ENV !== 'development') {
    return target;
  }

  return new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === 'symbol') return (obj as any)[prop];
      const currentPath = path ? `${path}.${prop}` : prop;
      const val = (obj as any)[prop];

      if (val === undefined) {
        console.warn(`[i18n] Missing translation key: "${currentPath}" for language "${lang}"`);
        return currentPath;
      }

      if (typeof val === 'object' && val !== null) {
        return createTranslationProxy(val, lang, currentPath);
      }

      return val;
    },
  });
}

export function I18nProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    // Client-side detection if cookie differs or wasn't present on initial server load
    const hasCookie = typeof document !== 'undefined' && /(?:^|;\s*)venehire_lang=(en|es)(?:;|$)/.test(document.cookie);
    const detected = getInitialClientLang(initialLang);
    if (!hasCookie && detected === 'es' && typeof document !== 'undefined') {
      document.cookie = 'venehire_lang=es; max-age=31536000; path=/; SameSite=Lax';
    }
    if (detected !== lang) {
      setLangState(detected);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    if (typeof document !== 'undefined') {
      document.cookie = `venehire_lang=${newLang}; max-age=31536000; path=/; SameSite=Lax`;
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useMemo(() => {
    const raw = dictionaries[lang] || dictionaries.en;
    return createTranslationProxy(raw, lang);
  }, [lang]);

  const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      const locale = lang === 'es' ? 'es-ES' : 'en-US';
      return new Intl.DateTimeFormat(locale, options ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    try {
      const locale = lang === 'es' ? 'es-ES' : 'en-US';
      return new Intl.NumberFormat(locale, options).format(num);
    } catch {
      return String(num);
    }
  };

  const formatCurrency = (num: number, currency = 'USD'): string => {
    try {
      const locale = lang === 'es' ? 'es-ES' : 'en-US';
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num);
    } catch {
      return `$${num}`;
    }
  };

  const value: I18nContextType = {
    lang,
    setLang,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. error boundary)
    const fallbackLang = getInitialClientLang('en');
    const dict = dictionaries[fallbackLang] || dictionaries.en;
    return {
      lang: fallbackLang,
      setLang: () => {},
      t: dict,
      formatDate: (d) => String(d),
      formatNumber: (n) => String(n),
      formatCurrency: (n) => `$${n}`,
    };
  }
  return context;
}

export const useI18n = useT;
