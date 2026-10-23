import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',
    rollupOptions: {
      // Le bundle SSR externalise React : le découpage manuel n'a de sens
      // que pour le bundle navigateur.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              motion: ['framer-motion'],
              icons: ['lucide-react'],
            },
          },
    },
  },
  ssr: {
    noExternal: ['lucide-react'],
  },
}));
