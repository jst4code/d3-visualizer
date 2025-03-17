import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL,//'http://localhost:3001/api',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Use this if your backend doesn't expect /api prefix
      },
    },
  },
});
