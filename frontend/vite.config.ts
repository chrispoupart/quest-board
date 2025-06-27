import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@radix-ui/react-tabs": path.resolve(__dirname, "node_modules/@radix-ui/react-tabs"),
      "@radix-ui/react-avatar": path.resolve(__dirname, "node_modules/@radix-ui/react-avatar"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {},
      maxParallelFileOps: 100,
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
