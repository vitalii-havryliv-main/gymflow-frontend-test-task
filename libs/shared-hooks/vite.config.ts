/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/shared-hooks',
  plugins: [nxViteTsPaths()],
  test: {
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reports: ['text', 'lcov'],
    },
  },
});

