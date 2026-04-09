import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  optimizeDeps: {
    include: ['dagre'],
    esbuildOptions: {
      supported: {
        bigint: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          dagre: ['dagre'],
        },
      },
    },
  },
})
