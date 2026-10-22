import { defineConfig } from 'vite';

// base relativa: el dist/ funciona igual en Netlify y en GitHub Pages (subcarpeta).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // three.js va en su propio chunk diferido (EvidenceStage); su tamaño es esperable.
    chunkSizeWarningLimit: 800,
  },
});
