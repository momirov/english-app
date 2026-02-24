import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/english-app/',
  server: {
    allowedHosts: ['astra.tail783048.ts.net'],
  },
})
