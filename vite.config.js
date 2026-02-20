import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ini akan membuat server bisa diakses lewat IP apa pun di jaringan lokal kamu
    port: 5173
  }
})
