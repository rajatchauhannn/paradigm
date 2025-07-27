const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  build: {
    // This prevents Vite from deleting the compiled server code.
    emptyOutDir: false,
  },
  server: {
    proxy: {
      // This proxies any request starting with /api to your backend server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});