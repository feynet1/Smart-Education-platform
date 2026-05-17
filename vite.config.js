import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-64x64.png'],
      manifest: {
        name: 'GG SCHOOL NETWORK',
        short_name: 'GG School',
        description: 'The official educational platform for Gerba Guracha City, Kuyu',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '412x412',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // MUI core
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // MUI icons (large)
          'mui-icons': ['@mui/icons-material'],
          // MUI data components
          'mui-data': ['@mui/x-data-grid', '@mui/x-charts'],
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          // Form & validation
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilities
          'utils': ['date-fns', 'qrcode.react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
