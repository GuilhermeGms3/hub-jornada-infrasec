import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: '../../modules/net-r01',
    emptyOutDir: true,
    lib: { entry: 'src/embedded.tsx', formats: ['es'], fileName: () => 'player.js' },
  },
});
