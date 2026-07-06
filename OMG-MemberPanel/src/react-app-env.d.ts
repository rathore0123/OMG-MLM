/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WEBSITEAPI_URL: string;
  readonly VITE_SECRET_KEY: string;
  readonly VITE_POPUP_URL: string;
  // add more as needed...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
