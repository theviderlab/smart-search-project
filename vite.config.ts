import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  // Read VITE_* from .env files (e.g. .env.pages via `--mode pages`) and the
  // shell, so the base path works from either source.
  const env = loadEnv(mode, __dirname, 'VITE_')
  return {
  // Base public path. Defaults to '/' for dev/preview; set VITE_BASE_URL to the
  // repo name (e.g. '/smart-search-project/') when building for GitHub Pages.
  base: env.VITE_BASE_URL || '/',
  plugins: [react()],
  // .env lives next to this config (src/frontend2/.env) — keep it independent of the
  // root .env used by frontend1 and the backend.
  envPrefix: ['VITE_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  }
})
