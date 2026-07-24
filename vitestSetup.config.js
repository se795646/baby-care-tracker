import { config } from '@vue/test-utils';
import i18n from '@/i18n/index.js';
import vuetify from '@/plugins/vuetify.js';
import './vuetify.config.js';
import { vi } from 'vitest';

config.global.mocks = {
    t: (tKey) => tKey
};
config.global.plugins = [i18n, vuetify];

HTMLCanvasElement.prototype.getContext = () => {
    return {
        fillRect: vi.fn()
    };
};
