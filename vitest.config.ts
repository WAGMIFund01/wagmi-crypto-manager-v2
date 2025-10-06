import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    // Mobile testing configuration
    testTimeout: 15000, // Increased for mobile testing
    // Ensure React 18 is properly configured for testing
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true,
        url: 'http://localhost:3000'
      }
    },
    // Add test timeout and retry configuration
    hookTimeout: 10000,
    // Force development mode for testing
    env: {
      NODE_ENV: 'test'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.next/**',
        '**/dist/**',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
      // Include specific directories for better coverage
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/app/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/features/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
