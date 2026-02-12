import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const PORT = Number(process.env.VITE_PORT) || 5172;
const HMR_HOST = process.env.VITE_HMR_HOST || '192.168.0.11';
const ORIGIN = `http://${HMR_HOST}:${PORT}`;

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: PORT,
        strictPort: true,
        cors: true,
        origin: ORIGIN,
        hmr: {
            host: HMR_HOST,
            port: PORT,
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
