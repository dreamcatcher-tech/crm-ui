import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


loadEnv('development', '.');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
