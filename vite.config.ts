import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 🎯 Essential for Capacitor: makes all asset paths relative
  base: './', 
  resolve: {
    alias: {
      // 🎯 Helps Vite find your files correctly in a monorepo structure
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 🎯 Ensures the output goes to 'dist' so Capacitor can find it
    outDir: 'dist',
    // 🎯 Prevents issues with older Android system webviews
    target: 'es2015', 
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
  }
})