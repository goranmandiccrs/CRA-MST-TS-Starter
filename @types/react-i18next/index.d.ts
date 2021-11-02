import 'react-i18next';
import basic from '../../public/locales/en/basic.json';
import sr_basic from '../../public/locales/sr/basic.json';
export const resources = {
  en: {
    basic,
  },
  sr: {
    sr_basic,
  },
};

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en'];
  }
}
