import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    // En dev, Vite relaie l'API et le WebSocket vers Express : tout est sur la même
    // origine, donc le cookie httpOnly est envoyé sans configuration CORS
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
            '/ws': { target: 'ws://localhost:3000', ws: true },
        },
    },
})
