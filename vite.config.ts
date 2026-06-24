import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { IncomingMessage } from 'http'

const htmlBypass = (req: IncomingMessage) => {
  if (req.headers.accept?.includes('text/html')) {
    return '/index.html';
  }
};

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
        bypass: htmlBypass,
      },
      '^/incharge/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
        bypass: htmlBypass,
      },
      '^/watchman/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
        bypass: htmlBypass,
      },
      '^/warden/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
        bypass: htmlBypass,
      },
      '^/admin/.*': {
        target: 'https://api.jit.college',
        changeOrigin: true,
        secure: false,
        bypass: htmlBypass,
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
