import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/dist/',
        'packages/popup/src/dev-mock.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@ytosc/core': resolve(__dirname, './packages/core/src'),
      '@ytosc/ui': resolve(__dirname, './packages/ui/src'),
    },
  },
});

