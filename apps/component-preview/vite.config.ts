import path from 'path'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    vanillaExtractPlugin({
      identifiers: 'debug',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['@vanilla-extract/css', '@vanilla-extract/recipes'],
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['@vanilla-extract/css', '@vanilla-extract/recipes'],
  },
})
