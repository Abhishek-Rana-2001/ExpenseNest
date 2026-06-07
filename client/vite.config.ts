import path from 'path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read .env files in Node context (process.cwd at config-load time).
  // Third arg '' means "load every var" — not just ones prefixed with VITE_.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react({
        babel: {
          // React Compiler (keep first in Babel pipeline)
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL ?? 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
