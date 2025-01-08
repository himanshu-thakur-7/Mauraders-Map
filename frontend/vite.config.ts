import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist', // Ensure the build output goes to 'dist' folder (Netlify default)
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript',
    },
  },
})