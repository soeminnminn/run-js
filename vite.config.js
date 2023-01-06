import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import bundleWorker from './plugins/plugin-bundle-worker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [bundleWorker(), vue()],
  // build: {
  //   rollupOptions: {
  //     output: {
  //       // https://github.com/microsoft/monaco-editor/issues/2122
  //       manualChunks: {
  //         jsonWorker: [`monaco-editor/esm/vs/language/json/json.worker`],
  //         cssWorker: [`monaco-editor/esm/vs/language/css/css.worker`],
  //         htmlWorker: [`monaco-editor/esm/vs/language/html/html.worker`],
  //         tsWorker: [`monaco-editor/esm/vs/language/typescript/ts.worker`],
  //         editorWorker: [`monaco-editor/esm/vs/editor/editor.worker`],
  //       },
  //     },
  //   },
  // },
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
})
