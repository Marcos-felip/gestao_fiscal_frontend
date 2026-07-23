import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueInspector from 'vite-plugin-vue-inspector'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueInspector({
      launchEditor: 'code',
    }),
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})