import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// You might be using a plugin to run your API file.
// For example, using 'vite-plugin-node'.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Requests to any path starting with /api will be sent to the target
      '/api': {
        target: 'http://localhost:3000', // <-- MAKE SURE THIS PORT IS CORRECT!
        changeOrigin: true, // Necessary for virtual hosted sites
        secure: false,      // Can be false for http
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes /api from the start of the path
      },
    },
  },
});