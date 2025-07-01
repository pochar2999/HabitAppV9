import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
        forgot: 'forgot.html',
        verify: 'verify.html',
        profile: 'profile.html'
      },
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
  // Ensure proper handling of ES modules for GitHub Pages
  esbuild: {
    target: 'es2020'
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
  }
})
