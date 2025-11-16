import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react()
  ],
  // Use subdirectory base for production (GitHub Pages), root for development
  base: mode === 'production' ? '/the-marauders-map/' : '/',
}));
