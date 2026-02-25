import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/metar-weather-limits-analyzer/',
  plugins: [react()],
})