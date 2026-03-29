import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable source maps for production debugging (optional, increases build time)
    sourcemap: false,
    
    // Chunk size warning limit (in kbs)
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy
        manualChunks: (id) => {
          // Vendor chunks - separate React and React Router
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            // Other node_modules go into vendor chunk
            return 'vendor'
          }
          
          // Admin pages chunk
          if (id.includes('pages/Admin')) {
            return 'admin-pages'
          }
          
          // Patient pages chunk (excluding HomePage, About, ShowTipDetails, ArticleDetail which are loaded separately)
          if (id.includes('pages/Patient') && 
              !id.includes('HomePage') && 
              !id.includes('About') && 
              !id.includes('ShowTipDetails') && 
              !id.includes('ArticleDetail')) {
            return 'patient-pages'
          }
          
          // Context providers chunk
          if (id.includes('context/')) {
            return 'context-providers'
          }
        },
        
        // Naming pattern for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[ext]/[name]-[hash][extname]`
        }
      }
    },
    
    // Minification settings
    minify: 'esbuild', // Use esbuild for faster builds (alternative: 'terser' for better compression)
    // Note: Console.log removal handled by esbuild automatically in production builds
    
    // Target modern browsers for smaller bundle size
    target: 'es2015',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Generate manifest for better caching
    manifest: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
