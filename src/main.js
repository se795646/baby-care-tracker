import App from './App.vue';
import store from './store/index.js';
import router from './router';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
import bootstrapApp from '@/foundation/bootstrap/bootstrapApp';
import './assets/css/tailwind.css';

const CONFIG_URL = `config/serverInfo.json?version=${__VERSION__}`; // eslint-disable-line no-undef

bootstrapApp({
    App,
    configUrl: CONFIG_URL,
    plugins: [router, vuetify, i18n, store]
}).catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to load app config:', error);
});
