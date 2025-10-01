import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw-advanced.js',
      registerType: 'prompt',
      injectManifest: {
        swSrc: 'public/sw-advanced.js',
        swDest: 'dist/sw-advanced.js',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Increase cache size limit for internal PWA
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Don't precache large assets - let runtime caching handle them
        globIgnores: ['**/index-*.js'] // Don't precache main bundle
      },
      devOptions: {
        enabled: false,
        type: 'module'
      },
      // Disable auto-registration to avoid conflicts
      injectRegister: false,
      manifest: false
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // Run compression 3 times for maximum results
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true, // Unsafe comparisons optimizations
        unsafe_math: true, // Optimize math expressions
        unsafe_methods: true, // Optimize method calls
        toplevel: true, // Mangle top-level scope
        keep_fargs: false, // Remove unused function arguments
        keep_fnames: false, // Remove function names when safe
      },
      mangle: {
        safari10: true, // Fix Safari 10+ compatibility
        toplevel: true, // Mangle top-level names
      },
      format: {
        comments: false, // Remove all comments
        ecma: 2020, // Use modern ECMAScript for smaller output
      },
    },
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Aggressive code splitting for better performance
        manualChunks: {
          // Core React libraries
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI libraries
          'radix-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-popover', 
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          
          // Data libraries
          'data-libs': ['@tanstack/react-query', '@supabase/supabase-js'],
          
          // Form libraries
          'form-libs': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Date libraries
          'date-libs': ['date-fns', 'react-day-picker'],
          
          // Rich text editor
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-heading'],
          
          // Charts and visualization
          'charts': ['recharts'],
          
          // Heavy components that should be separate
          'task-components': ['src/components/CreateTaskModal.tsx'],
          'calendar-components': ['src/pages/CalendarPage.tsx'],
          'settings-components': ['src/pages/SettingsPage.tsx']
        },
        // Use content-based hashing for better cache invalidation
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline small assets
    sourcemap: false, // Disable sourcemaps in production for smaller files
    // Enable CSS minification
    cssMinify: true,
    // Increase chunk size warning limit since this is an internal app
    chunkSizeWarningLimit: 1000, // 1MB instead of 500KB
  },
}));
