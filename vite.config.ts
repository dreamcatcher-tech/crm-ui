import { defineConfig, loadEnv } from 'vite'
import deno from '@deno/vite-plugin'
import react from '@vitejs/plugin-react'
import { barrel } from 'vite-plugin-barrel'

loadEnv('development', '.')

const env = Deno.env.get('NODE_ENV')

const devPlugin = env === 'development'
  ? barrel({ packages: ['lucide-react'] })
  : undefined

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [deno(), react(), devPlugin],
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
      'npm:immutable@5.1.1': 'immutable',
      'npm:/zustand@5.0.3/vanilla': 'zustand/vanilla',
      'npm:/zustand@5.0.3/middleware': 'zustand/middleware',
      'npm:/zustand@5.0.3/react': 'zustand/react',
      'npm:react@19.1.0/jsx-runtime': 'react/jsx-runtime',
      'npm:react@19.1.0': 'react',
      'npm:p-limit@6.2.0': 'p-limit',
    },
  },
  build: {
    sourcemap: true,
  },
})
