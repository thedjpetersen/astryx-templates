import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const compat = (file: string) =>
  fileURLToPath(new URL(`./demo/src/compat/${file}`, import.meta.url));

export default defineConfig({
  build: {
    // The theme's scheme toggle depends on native light-dark(): the default
    // css target lets Lightning CSS downlevel it to a prefers-color-scheme
    // polyfill that only follows the OS, silently breaking the in-page
    // System/Light/Dark toggle in production builds.
    cssTarget: ['chrome124', 'safari18', 'firefox125', 'edge124'],
  },
  plugins: [stylex.vite(), react()],
  resolve: {
    alias: {
      '@astryxdesign/core/Stat': compat('Stat.tsx'),
      '@astryxdesign/lab': compat('lab.tsx'),
    },
  },
});
