import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isSafeBuild = process.env.VITE_SAFE_BUILD === '1';
  const isSimpleBundle = process.env.VITE_SIMPLE_BUNDLE === '1';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      !isSimpleBundle && legacy({
        targets: ['defaults', 'not IE 11', 'iOS >= 12', 'Safari >= 13'],
        modernPolyfills: true,
      }),
      // 🚫 SERVICE WORKER DISABLED TEMPORARILY FOR TESTING
      // VitePWA({
      // strategies: 'injectManifest',
      // srcDir: 'public',
      // filename: 'sw-advanced.js',
      // registerType: 'prompt',
      // injectManifest: {
      //   swSrc: 'public/sw-advanced.js',
      //   swDest: 'dist/sw-advanced.js',
      //   globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      //   // Increase cache size limit for internal PWA
      //   maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      //   // Don't precache large assets - let runtime caching handle them
      //   globIgnores: ['**/index-*.js'] // Don't precache main bundle
      // },
      // devOptions: {
      //   enabled: false,
      //   type: 'module'
      // },
      // // Disable auto-registration to avoid conflicts
      // injectRegister: false,
      // manifest: false
      // })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    'process.env': {},
    // Inject build hash for Service Worker versioning
    '__VITE_BUILD_HASH__': JSON.stringify(
      mode === 'production' 
        ? `1.0.0-${Date.now().toString(36)}` // Hash based on timestamp in production
        : '1.0.0-dev' // Static version in development
    ),
  },
  build: {
    // Target Safari 14+ and ES2018 for better compatibility
    target: ['es2018', 'safari14'],
    // Enable minification with Safari-friendly settings
    minify: isSimpleBundle ? false : 'terser',
    terserOptions: isSimpleBundle ? {} : {
      compress: {
        drop_console: !isSafeBuild, // Keep console in safe mode for debugging
        drop_debugger: true,
        pure_funcs: !isSafeBuild ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
        passes: isSafeBuild ? 1 : 2, // Fewer passes in safe mode
        // Remove all unsafe optimizations for Safari compatibility
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        inline: 2, // Moderate inlining
        join_vars: true,
        conditionals: true,
        booleans: true,
        loops: true,
        unused: true,
        if_return: true,
        evaluate: true,
        sequences: true,
        comparisons: true,
      },
      mangle: {
        safari10: true, // Essential for Safari compatibility
        // No toplevel or property mangling to avoid Safari issues
      },
      format: {
        comments: false,
        ecma: 2018, // Match build target
        ascii_only: true,
        semicolons: true, // Use semicolons for better compatibility
      },
    },
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Use content-based hashing for better cache invalidation
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Compact output
        compact: !isSimpleBundle,
        // Manual chunks for better code splitting (disabled in simple mode)
        manualChunks: isSimpleBundle ? undefined : (id) => {
          // React core (always needed)
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          
          // Radix UI components (many components)
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          
          // React Query (state manager)
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // Tiptap editor (VERY heavy, only for NotesPage)
          if (id.includes('@tiptap')) {
            return 'vendor-tiptap';
          }
          
          // Charts (only for dashboard/stats)
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          
          // Heavy optional libs
          if (id.includes('ogl') || 
              id.includes('react-markdown') || 
              id.includes('react-draggable')) {
            return 'vendor-heavy';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
        },
      },
      treeshake: isSimpleBundle ? false : {
        // Enable aggressive tree-shaking (disabled in simple mode)
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline small assets
    sourcemap: isSafeBuild || isSimpleBundle, // Enable sourcemaps in safe/simple mode for debugging
    // Enable CSS minification
    cssMinify: true,
    cssCodeSplit: true,
    // Increase chunk size warning limit since this is an internal app
    chunkSizeWarningLimit: 1000, // 1MB instead of 500KB
    // Enable module preload for better performance
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        // Preload all dependencies
        return deps;
      }
    },
    reportCompressedSize: false, // Speed up build by skipping gzip size reporting
  },
};
});
