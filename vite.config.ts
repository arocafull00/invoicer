import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import nodeAdapter from '@hono/vite-dev-server/node'

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      devServer({
        entry: './server/app.ts',
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
