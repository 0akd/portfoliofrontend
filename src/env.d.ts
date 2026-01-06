/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_URL: string;
  readonly SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}