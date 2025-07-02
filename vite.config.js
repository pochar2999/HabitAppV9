import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/3njvyhyj/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '26efa485-2c6f-493f-b23c-1b101cb247fa-00-rcsxp8wxxbz0.riker.replit.dev',
      '.replit.dev'
    ]
  },
  esbuild: {
    target: 'es2020'
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
  }
})
