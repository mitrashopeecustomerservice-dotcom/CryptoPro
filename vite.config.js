import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Mengizinkan akses dari semua network interface (publik/lokal)
    host: '0.0.0.0', 
    port: 5173,
    strictPort: true,
    cors: true
  }
})
