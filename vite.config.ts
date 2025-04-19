import { defineConfig, loadEnv } from 'vite'
import deno from '@deno/vite-plugin'
import react from '@vitejs/plugin-react'

loadEnv('development', '.')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [deno(), react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // without these, the build fails with confusing errors
      'npm:zod@3.24.3': 'zod',
      'npm:serialize-error@12.0.0': 'serialize-error',
      'npm:fast-deep-equal@3.1.3/es6/index.js': 'fast-deep-equal',
      'npm:debug@4.4.0': 'debug',
      'npm:it-pushable@3.2.3': 'it-pushable',
      'npm:@msgpack/msgpack@3.1.1': '@msgpack/msgpack',
      'npm:@opentelemetry/api@1.9.0': '@opentelemetry/api',
    },
  },
})
