import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources:{
      zh:zh,
      en:en,
    },
    lng: "zh",
    fallbackLng: "zh",
    debug: process.env.NODE_ENV === 'production' ? false : true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 