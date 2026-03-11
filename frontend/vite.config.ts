import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  base: '/CollabCanvas/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Run tests in isolated forked processes to prevent the heavy
    // CollaborativeCanvas component from OOM-killing the entire suite.
    pool: 'forks',
    poolOptions: {
      forks: {
        // Limit concurrency so at most 2 worker processes run at once;
        // this keeps peak RAM manageable on the 7 GB CI runner.
        minForks: 1,
        maxForks: 2,
        // Give each fork 3 GB – enough for the canvas render without OOM.
        execArgv: ['--max-old-space-size=3072'],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})