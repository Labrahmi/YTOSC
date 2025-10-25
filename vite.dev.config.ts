import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Development config for UI development with HMR
export default defineConfig({
  plugins: [react()],
  root: 'packages/popup',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@ui': resolve(__dirname, 'packages/ui/src'),
    },
  },
});
