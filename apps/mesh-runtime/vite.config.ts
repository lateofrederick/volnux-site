import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  envDir: workspaceRoot,
  server: {
    port: 5175,
    strictPort: true,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
