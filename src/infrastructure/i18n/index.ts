import { db } from '@/shared/helpers/database';
import { Collection } from '@/shared/models/collection';
import i18n from 'i18next';
import { en, es, pt } from './locales';

const languageStorage = db.get(Collection.LANGUAGE, { universal: true });
const language = languageStorage || 'en';

i18n.init({
  resources: {
    en: { ...en },
    es: { ...es },
    pt: { ...pt },
  },
  lng: language,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  pluralSeparator: '_',
  keySeparator: '.',
  supportedLngs: ['en', 'es', 'pt'],
});
