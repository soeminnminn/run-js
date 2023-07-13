import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import monacoEditorPlugin from './vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
//  base: '/run-js/',
  plugins: [
    monacoEditorPlugin(), 
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~highlightjs': path.resolve(__dirname, 'node_modules/highlight.js'),
      '~xterm': path.resolve(__dirname, 'node_modules/xterm'),
    }
  },
  server: {
    port: 3000,
    hot: true
  }
});
