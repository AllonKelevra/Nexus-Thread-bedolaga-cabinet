import i18n, { type ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getTelegramLanguageCode } from './hooks/useTelegramSDK';

const localeLoaders: Record<string, () => Promise<{ default: ResourceLanguage }>> = {
  ru: () => import('./locales/ru.json'),
  en: () => import('./locales/en.json'),
  zh: () => import('./locales/zh.json'),
  fa: () => import('./locales/fa.json'),
};

const SUPPORTED_LANGS = Object.keys(localeLoaders);
const FALLBACK_LNG = 'ru';
const LANGUAGE_STORAGE_KEY = 'cabinet_language';

const loadedLanguages = new Set<string>();

async function loadLanguage(lng: string): Promise<void> {
  if (loadedLanguages.has(lng)) return;

  const loader = localeLoaders[lng];
  if (!loader) return;

  const mod = await loader();
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true);
  loadedLanguages.add(lng);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: FALLBACK_LNG,
    supportedLngs: SUPPORTED_LANGS,
    partialBundledLanguages: true,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cabinet_language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    showSupportNotice: false,
  });

// Load detected language + fallback on startup
const detectedLng = i18n.language?.split('-')[0] || FALLBACK_LNG;
const langsToLoad = [FALLBACK_LNG, ...(detectedLng !== FALLBACK_LNG ? [detectedLng] : [])];
Promise.all(langsToLoad.map(loadLanguage));

// Lazy-load on language change
i18n.on('languageChanged', (lng: string) => {
  const code = lng.split('-')[0];
  loadLanguage(code);
});

/**
 * On first run inside Telegram (no explicit stored choice), adopt the user's
 * Telegram client language. Must be called after the Telegram SDK is initialised
 * (e.g. from main.tsx), since launch params are unavailable before init().
 */
export function applyTelegramLanguage(): void {
  try {
    if (localStorage.getItem(LANGUAGE_STORAGE_KEY)) return; // explicit choice wins
  } catch {
    return;
  }
  const code = getTelegramLanguageCode();
  if (code && SUPPORTED_LANGS.includes(code) && i18n.language?.split('-')[0] !== code) {
    i18n.changeLanguage(code);
  }
}

export default i18n;
