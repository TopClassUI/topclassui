import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite prints a "module level directive" warning for each 'use client' file of the library; it is harmless.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
