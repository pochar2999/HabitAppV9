import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
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
  }
})