import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/india_oss/",

  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'],
  },

  define: {
    'global': 'window', // <<<<<<<<<<<< Add this
  },
})
