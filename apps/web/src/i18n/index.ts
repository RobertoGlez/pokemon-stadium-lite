import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLogin from './locales/en/login.json';
import enLobby from './locales/en/lobby.json';
import enBattle from './locales/en/battle.json';
import enResults from './locales/en/results.json';

import esCommon from './locales/es/common.json';
import esLogin from './locales/es/login.json';
import esLobby from './locales/es/lobby.json';
import esBattle from './locales/es/battle.json';
import esResults from './locales/es/results.json';

export const supportedLanguages = ['es', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        login: enLogin,
        lobby: enLobby,
        battle: enBattle,
        results: enResults,
      },
      es: {
        common: esCommon,
        login: esLogin,
        lobby: esLobby,
        battle: esBattle,
        results: esResults,
      },
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common', 'login', 'lobby', 'battle', 'results'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
