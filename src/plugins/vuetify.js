import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as labs from 'vuetify/labs/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
    components: {
        ...components,
        ...labs
    },
    display: {
        thresholds: {
            sm: 600,
            md: 960,
            lg: 1350
        }
    },
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    }
});
