import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite 8 builds the library's 'use client' files without the "module level directive" warning older Vite printed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
