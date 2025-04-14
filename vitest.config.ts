import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/lib/server/db/__tests__/',
        'src/lib/server/db/test-utils.ts'
      ]
    },
    alias: {
      '$lib': './src/lib',
      '$lib/server': './src/lib/server'
    }
  }
}) 