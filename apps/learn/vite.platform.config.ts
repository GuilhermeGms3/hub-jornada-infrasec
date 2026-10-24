import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const distributionNotice = `/*!\n${readFileSync(new URL('./public/THIRD_PARTY_NOTICES.txt', import.meta.url), 'utf8')}\n*/`;

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../platform',
    emptyOutDir: true,
    rolldownOptions: { output: { postBanner: distributionNotice } },
  },
});
