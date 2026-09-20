import type { en } from './en';

export type Lang = 'en' | 'es';
export type TranslationSchema = typeof en;

export interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationSchema;
  formatDate: (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (num: number, currency?: string) => string;
}
