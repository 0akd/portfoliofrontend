// astro.config.mjs
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
// REMOVE: import node from '@astrojs/node'; 
import cloudflare from '@astrojs/cloudflare'; // <--- ADD THIS

export default defineConfig({
  output: 'server', 
  
  // CHANGE THIS SECTION:
  adapter: cloudflare({
    imageService: 'cloudflare', // Optional: Use Cloudflare for image optimization
  }),

  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'My Astro App',
        short_name: 'AstroApp',
        description: 'My awesome Astro site description',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/404',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}']
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/]
      }
    }), 
    react(),
    tailwind()
  ]
});