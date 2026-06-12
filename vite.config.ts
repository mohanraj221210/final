import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '^/staff/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '^/incharge/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '^/watchman/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '^/warden/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  }
})
