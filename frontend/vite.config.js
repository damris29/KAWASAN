import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const frontendDirectory = fileURLToPath(new URL('.', import.meta.url))
  const { VITE_API_BASE_URL: apiTarget } = loadEnv(mode, frontendDirectory)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: apiTarget ? { '/api': { target: apiTarget, changeOrigin: true } } : undefined,
    },
  }
})
