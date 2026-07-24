import { createApp } from 'vue';
import App from './App.vue';
import store from './store/index.js';
import router from './router';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
import './assets/css/tailwind.css';

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(i18n);
app.use(store);

app.mount('#app');
