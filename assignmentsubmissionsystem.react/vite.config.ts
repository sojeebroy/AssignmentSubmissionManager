import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://localhost:7013',
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(fileURLToPath(new URL('./', import.meta.url)), 'src'),
        },
    },
})
