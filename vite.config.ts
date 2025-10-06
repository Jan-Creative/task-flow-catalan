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
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    'process.env': {}
  },
  build: {
    // Enable aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 4, // Run compression 4 times for maximum results
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true, // Unsafe comparisons optimizations
        unsafe_math: true, // Optimize math expressions
        unsafe_methods: true, // Optimize method calls
        unsafe_proto: true, // Optimize prototype access
        unsafe_regexp: true, // Optimize regular expressions
        unsafe_undefined: true, // Replace void 0 with undefined
        toplevel: true, // Mangle top-level scope
        keep_fargs: false, // Remove unused function arguments
        keep_fnames: false, // Remove function names when safe
        dead_code: true, // Remove unreachable code
        collapse_vars: true, // Collapse single-use variables
        reduce_vars: true, // Optimize variable assignments
        inline: 3, // Maximum inlining
        join_vars: true, // Join consecutive var statements
        side_effects: true, // Remove expressions with no side effects
        conditionals: true, // Optimize if-s and conditional expressions
        booleans: true, // Optimize boolean expressions
        loops: true, // Optimize loops
        unused: true, // Drop unused variables/functions
        hoist_funs: true, // Hoist function declarations
        hoist_vars: true, // Hoist var declarations
        if_return: true, // Optimize if/return and if/continue
        evaluate: true, // Evaluate constant expressions
        sequences: true, // Join consecutive simple statements
        comparisons: true, // Optimize comparisons
        arrows: true, // Convert functions to arrow functions where possible
      },
      mangle: {
        safari10: true, // Fix Safari 10+ compatibility
        toplevel: true, // Mangle top-level names
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
      format: {
        comments: false, // Remove all comments
        ecma: 2020, // Use modern ECMAScript for smaller output
        ascii_only: true, // Escape non-ASCII characters
        semicolons: false, // Use ASI to save bytes
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
        compact: true,
      },
      treeshake: {
        // Enable aggressive tree-shaking
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline small assets
    sourcemap: false, // Disable sourcemaps in production for smaller files
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
}));
