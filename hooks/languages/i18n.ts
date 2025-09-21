import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import yor from './locales/yor.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

i18n
    .use(initReactI18next)
    .init({
        lng: deviceLanguage,
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            yor: { translation: yor },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
