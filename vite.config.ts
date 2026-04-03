import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  appType: 'spa',   // enables history-API fallback in dev so /level/3 reloads correctly
})
