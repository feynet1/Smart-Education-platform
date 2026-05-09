import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
