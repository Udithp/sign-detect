import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // MediaPipe uses IIFE bundles — exclude from Vite pre-bundler.
    // We load them via <script> tags from /public/ instead.
    exclude: ['@mediapipe/hands', '@mediapipe/camera_utils'],
  },
})
