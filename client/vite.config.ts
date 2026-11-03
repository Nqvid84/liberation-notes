import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isGhPages =
    mode === 'gh-pages' ||
    process.env.GITHUB_PAGES === 'true' ||
    process.env.VITE_GITHUB_PAGES === 'true'

  return {
    base: isGhPages ? '/liberation-notes/' : '/',
    define: {
      'import.meta.env.VITE_GITHUB_PAGES': JSON.stringify(isGhPages ? 'true' : 'false'),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        shared: path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      proxy: {
        // Forward all /api requests to the Express backend during development.
        // No CORS config needed — Vite acts as the intermediary.
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
