import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          radix: ['@radix-ui/react-avatar', '@radix-ui/react-tabs'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      'react',
      'react-dom',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [],
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
