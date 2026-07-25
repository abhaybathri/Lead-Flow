import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Make VITE_API_URL available — env var takes priority, otherwise use the
  // deployed Render URL so production works without manual Vercel config.
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://lead-flow-xnuo.onrender.com'
    ),
  },

  server: {
    // Local dev proxy — rewrites /api/* to localhost:5000
    // This overrides the define above during `vite dev` because
    // we also set VITE_API_URL='' in .env for local dev.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
