import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// IMPORTANT: if you deploy to https://<username>.github.io/<repo-name>/
// set base to '/<repo-name>/'. If you deploy to a custom domain or to
// https://<username>.github.io/ (a "user site" repo), set base to '/'.
export default defineConfig({
  base: '/broker-crm/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Broker CRM',
        short_name: 'Broker CRM',
        description: 'Real estate broker pipeline & lead CRM',
        theme_color: '#0071E3',
        background_color: '#F5F5F7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/broker-crm/',
        scope: '/broker-crm/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
