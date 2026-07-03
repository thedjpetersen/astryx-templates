import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const compat = (file: string) =>
  fileURLToPath(new URL(`./demo/src/compat/${file}`, import.meta.url));

export default defineConfig({
  plugins: [stylex.vite(), react()],
  resolve: {
    alias: {
      '@astryxdesign/core/Stat': compat('Stat.tsx'),
      '@astryxdesign/lab': compat('lab.tsx'),
    },
  },
});
