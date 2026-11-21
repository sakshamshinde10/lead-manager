import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    // In development the browser talks to Vite, and Vite forwards /api calls to
    // the Express server. That way the app and the API share one origin and
    // we never fight with CORS while developing.
    proxy: { '/api': 'http://localhost:5000' },
  },

  build: {
    rolldownOptions: {
      output: {
        // Split big libraries into their own files. They rarely change, so
        // returning visitors keep them cached and only re-download our own
        // (small) code after an update.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'gsap', test: /node_modules[\\/](gsap|@gsap)[\\/]/ },
            { name: 'forms', test: /node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/ },
          ],
        },
      },
    },
  },
})
