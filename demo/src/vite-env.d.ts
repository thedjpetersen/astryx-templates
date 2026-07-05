declare module '*?raw' {
  const source: string;
  export default source;
}

declare module '*.css';

// Minimal slice of vite/client's ImportMeta augmentation (tsconfig pins
// "types", so the full vite/client types are not in scope).
interface ImportMetaEnv {
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

