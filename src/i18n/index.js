import { createI18n } from 'vue-i18n';
import en from './en.json';
import tw from './zh-TW.json';

const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: 'tw',
    fallbackLocale: 'en',
    messages: {
        en,
        tw,
        'zh-tw': tw
    }
});

export default i18n;
