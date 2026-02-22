import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-version',
      writeBundle() {
        // 将 version.json 复制到 dist 目录
        const versionPath = path.resolve(__dirname, 'version.json')
        const distPath = path.resolve(__dirname, 'dist', 'version.json')

        if (fs.existsSync(versionPath)) {
          const versionContent = fs.readFileSync(versionPath, 'utf8')
          fs.writeFileSync(distPath, versionContent)
          console.log('✓ Copied version.json to dist/')
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})
