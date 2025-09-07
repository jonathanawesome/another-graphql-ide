import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
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
});