import { fileURLToPath, URL } from 'url';
import { defineConfig, loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            host: true,
            port: 5173,
            allowedHosts: ['starter.benq.test']
        },
        // TODO: Change base path to match your deployment path
        base: './',
        plugins: [vueDevTools(), vue(), svgLoader()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '@tailwindConfig': fileURLToPath(
                    new URL('./tailwind.config.json', import.meta.url)
                )
            }
        },
        build: {
            commonjsOptions: {
                include: [/node_modules/],
                extensions: ['.js', '.cjs'],
                strictRequires: true,
                transformMixedEsModules: true
            },
            manifest: true
        },
        define: {
            __VERSION__: JSON.stringify(env.VERSION || '0.1.0')
        },
        test: {
            setupFiles: 'vitestSetup.config.js',
            deps: {
                inline: ['vuetify']
            },
            globals: true
        }
    };
});
