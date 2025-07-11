// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // Optional: Disable overlay for errors
    },
  },
  resolve: {
    alias: {
      '@mui/icons-material': '@mui/icons-material', // Ensure correct resolution
    },
  },
});