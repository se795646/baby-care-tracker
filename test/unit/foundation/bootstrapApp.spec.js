import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent } from 'vue';

// ─── Mock vue's createApp ─────────────────────────────────────────────────────
const mockApp = {
    provide: vi.fn(),
    use:     vi.fn(),
    mount:   vi.fn()
};

vi.mock('vue', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, createApp: vi.fn(() => mockApp) };
});

import { createApp } from 'vue';
import bootstrapApp from '@/foundation/bootstrap/bootstrapApp';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stubApp = defineComponent({ template: '<div />' });

function stubFetch(data, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        status: ok ? 200 : 500,
        json: vi.fn().mockResolvedValue(data)
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('bootstrapApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('config loading', () => {
        it('fetches config from configUrl and provides it as APP_CONFIG', async () => {
            vi.stubGlobal('fetch', stubFetch({ apiBase: '/api' }));

            await bootstrapApp({ App: stubApp, configUrl: '/config.json', plugins: [] });

            expect(fetch).toHaveBeenCalledWith('/config.json');
            expect(mockApp.provide).toHaveBeenCalledWith('APP_CONFIG', { apiBase: '/api' });
        });

        it('skips provide when configUrl is not given', async () => {
            await bootstrapApp({ App: stubApp, plugins: [] });

            expect(mockApp.provide).not.toHaveBeenCalled();
        });

        it('uses a custom provideKey when specified', async () => {
            vi.stubGlobal('fetch', stubFetch({ region: 'us' }));

            await bootstrapApp({ App: stubApp, configUrl: '/c.json', provideKey: 'MY_CONFIG', plugins: [] });

            expect(mockApp.provide).toHaveBeenCalledWith('MY_CONFIG', { region: 'us' });
        });

        it('throws when fetch returns a non-ok response', async () => {
            vi.stubGlobal('fetch', stubFetch(null, false));

            await expect(
                bootstrapApp({ App: stubApp, configUrl: '/bad.json', plugins: [] })
            ).rejects.toThrow('Failed to load config: 500');
        });
    });

    describe('plugin registration', () => {
        it('registers plain plugins via app.use(plugin)', async () => {
            const pluginA = { install: vi.fn() };
            const pluginB = { install: vi.fn() };

            await bootstrapApp({ App: stubApp, plugins: [pluginA, pluginB] });

            expect(mockApp.use).toHaveBeenCalledWith(pluginA);
            expect(mockApp.use).toHaveBeenCalledWith(pluginB);
        });

        it('registers plugins with options via app.use(plugin, options)', async () => {
            const plugin = { install: vi.fn() };
            const options = { theme: 'dark' };

            await bootstrapApp({ App: stubApp, plugins: [{ plugin, options }] });

            expect(mockApp.use).toHaveBeenCalledWith(plugin, options);
        });

        it('filters out null/falsy plugin entries', async () => {
            const plugin = { install: vi.fn() };

            await bootstrapApp({ App: stubApp, plugins: [plugin, null, undefined] });

            expect(mockApp.use).toHaveBeenCalledTimes(1);
            expect(mockApp.use).toHaveBeenCalledWith(plugin);
        });
    });

    describe('configureApp callback', () => {
        it('calls configureApp with { app, appConfig }', async () => {
            vi.stubGlobal('fetch', stubFetch({ env: 'test' }));
            const configureApp = vi.fn();

            await bootstrapApp({
                App: stubApp,
                configUrl: '/c.json',
                configureApp,
                plugins: []
            });

            expect(configureApp).toHaveBeenCalledOnce();
            const arg = configureApp.mock.calls[0][0];
            expect(arg.app).toBe(mockApp);
            expect(arg.appConfig).toEqual({ env: 'test' });
        });

        it('does not call configureApp when omitted', async () => {
            const configureApp = vi.fn();
            await bootstrapApp({ App: stubApp, plugins: [] });
            expect(configureApp).not.toHaveBeenCalled();
        });
    });

    describe('mount', () => {
        it('mounts to #app by default', async () => {
            await bootstrapApp({ App: stubApp, plugins: [] });
            expect(mockApp.mount).toHaveBeenCalledWith('#app');
        });

        it('mounts to a custom selector when mountSelector is given', async () => {
            await bootstrapApp({ App: stubApp, mountSelector: '#root', plugins: [] });
            expect(mockApp.mount).toHaveBeenCalledWith('#root');
        });

        it('returns the app instance and appConfig', async () => {
            vi.stubGlobal('fetch', stubFetch({ v: 1 }));

            const result = await bootstrapApp({
                App: stubApp,
                configUrl: '/c.json',
                plugins: []
            });

            expect(result.app).toBe(mockApp);
            expect(result.appConfig).toEqual({ v: 1 });
        });
    });

    describe('createApp', () => {
        it('creates an app from the provided App component', async () => {
            await bootstrapApp({ App: stubApp, plugins: [] });
            expect(createApp).toHaveBeenCalledWith(stubApp);
        });
    });
});
