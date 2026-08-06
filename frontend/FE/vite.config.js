import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Nếu deploy ở root domain
export default defineConfig({
  plugins: [react()],
  base: '/', // <-- quan trọng
})
