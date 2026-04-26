import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.svg'],
      manifest: {
        name: 'Fitness Tagebuch',
        short_name: 'FitLog',
        description: 'Dein persönliches Fitness Tagebuch',
        theme_color: '#080c16',
        background_color: '#080c16',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Fitnesstagebuch/',
        start_url: '/Fitnesstagebuch/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: '/Fitnesstagebuch/',
});
