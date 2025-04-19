import { defineConfig, loadEnv } from 'vite';
import deno from '@deno/vite-plugin'
import react from '@vitejs/plugin-react';


loadEnv('development', '.');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [deno(), react()],
  optimizeDeps: {
    exclude: ['lucide-react'],

  },
});
