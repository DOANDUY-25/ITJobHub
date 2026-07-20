import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Ghim cứng port — không tự đổi sang 5174/5175
    strictPort: true, // Nếu 5173 bị chiếm → báo lỗi thay vì đổi port ngầm
  },
})

