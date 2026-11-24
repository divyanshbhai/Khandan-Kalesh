import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifestFilename: 'manifest.webmanifest',
      filename: 'service-worker.js',
      includeAssets: [
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        'assets/brand/logo-39-bharat-nagar.png',
      ],
      manifest: {
        id: '/',
        name: '39 Bharat Nagar',
        short_name: '39 Bharat',
        description:
          'An original family-based retro arcade fighting game built around an exaggerated fictional property dispute in Bharat Nagar. Created & developed by Divyansh Ama QIM.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'landscape',
        theme_color: '#100b12',
        background_color: '#090605',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(brand|stages|characters|effects)\/.*\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bharat-nagar-sprites-v1',
              expiration: {
                maxEntries: 260,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/pwa-.*\.png$|\/apple-touch-icon\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bharat-nagar-icons-v1',
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.ENABLE_HMR === 'true',
    ...(process.env.ENABLE_HMR === 'true' ? {} : { ws: false as const }),
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
});
