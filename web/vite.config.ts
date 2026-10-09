import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The calculation engine lives one level up and has no build step of its own.
      '@engine': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: { fs: { allow: ['..'] } },
})
