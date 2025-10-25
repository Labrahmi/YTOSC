import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, renameSync, rmSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'chrome-extension-build',
      writeBundle() {
        // Copy manifest
        mkdirSync('dist', { recursive: true });
        copyFileSync('manifest.json', 'dist/manifest.json');
        
        // Copy icons if they exist
        const iconsDir = 'public/icons';
        if (existsSync(iconsDir)) {
          mkdirSync('dist/icons', { recursive: true });
          const files = readdirSync(iconsDir);
          files.forEach(file => {
            const srcPath = join(iconsDir, file);
            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, join('dist/icons', file));
            }
          });
        }
        
        // Move popup HTML from nested location to root
        const nestedHtml = 'dist/packages/popup/index.html';
        const rootHtml = 'dist/popup.html';
        if (existsSync(nestedHtml)) {
          copyFileSync(nestedHtml, rootHtml);
          rmSync('dist/packages', { recursive: true, force: true });
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'packages/popup/index.html'),
        'content-script': resolve(__dirname, 'packages/content-script/src/index.ts'),
        background: resolve(__dirname, 'packages/background/src/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js';
          }
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return '[name].[hash].js';
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.html') {
            return 'popup.html';
          }
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@ui': resolve(__dirname, 'packages/ui/src'),
    },
  },
});
