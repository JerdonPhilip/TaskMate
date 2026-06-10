import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Remove or change the base for local development
  // For local dev, use '/' 
  // For GitHub Pages, use '/taskmate/' (your repo name)
  base: '/TaskMate/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})