import { createApp } from 'vue';

async function loadJsonConfig(configUrl) {
    const response = await fetch(configUrl);

    if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
    }

    return response.json();
}

function normalizePlugin(pluginEntry) {
    if (!pluginEntry) {
        return null;
    }

    if (pluginEntry.plugin) {
        return pluginEntry;
    }

    return {
        plugin: pluginEntry
    };
}

export default async function bootstrapApp({
    App,
    configUrl,
    mountSelector = '#app',
    provideKey = 'APP_CONFIG',
    plugins = [],
    configureApp
}) {
    const appConfig = configUrl ? await loadJsonConfig(configUrl) : undefined;
    const app = createApp(App);

    if (typeof appConfig !== 'undefined') {
        app.provide(provideKey, appConfig);
    }

    plugins
        .map(normalizePlugin)
        .filter(Boolean)
        .forEach(({ plugin, options }) => {
            if (typeof options === 'undefined') {
                app.use(plugin);
                return;
            }
            app.use(plugin, options);
        });

    if (configureApp) {
        configureApp({ app, appConfig });
    }

    app.mount(mountSelector);

    return {
        app,
        appConfig
    };
}
