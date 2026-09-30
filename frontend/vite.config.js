import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Keep React in its own long-cached chunk.
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
});
