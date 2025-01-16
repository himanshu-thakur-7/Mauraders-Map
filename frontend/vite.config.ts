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
    port: 3000, // Use a custom port (default is 5173)
    strictPort: true, // Ensures the server fails if the port is already in use
    open: true, // Automatically opens the app in the default browser
  },
})