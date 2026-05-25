import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import nodeAdapter from '@hono/vite-dev-server/node'
import { viteBasicAuth } from './vite-basic-auth'

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      viteBasicAuth(),
      devServer({
        entry: './api/app.ts',
        export: 'app',
        adapter: nodeAdapter,
        exclude: [/^\/(?!api(?:\/|$)).*$/, ...defaultOptions.exclude],
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'radix-ui': path.resolve(__dirname, './src/shared/components/dialog.tsx'),
        '@components': path.resolve(__dirname, './src/shared/components'),
      },
    },
  }
})
