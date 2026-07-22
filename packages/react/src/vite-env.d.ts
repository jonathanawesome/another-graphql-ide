// Minimal Vite env typing. Previews are built by foundry (Vite), which injects
// these at build time, but `vite/client` isn't a dependency of this package, so
// declare just the fields we read.
interface ImportMetaEnv {
  readonly PROD: boolean
  readonly DEV: boolean
  readonly MODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
