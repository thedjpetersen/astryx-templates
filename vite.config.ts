import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const compat = (file: string) =>
  fileURLToPath(new URL(`./demo/src/compat/${file}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@astryxdesign/core/Stat': compat('Stat.tsx'),
      '@astryxdesign/lab': compat('lab.tsx'),
      '@heroicons/react/24/outline': compat('heroicons-outline.tsx'),
      '@heroicons/react/24/solid': compat('heroicons-solid.tsx'),
    },
  },
});
