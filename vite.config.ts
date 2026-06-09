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
  base: '/rpg-quest-board/', // Replace with your GitHub repo name for GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})