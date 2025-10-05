import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Fix React.act compatibility issue for testing library
global.React = React

// Ensure React.act is available for React 18
if (React.act) {
  global.React.act = React.act
} else {
  // Fallback for production builds where React.act is not available
  global.React.act = ((callback: () => any) => {
    const result = callback()
    return result instanceof Promise ? result : Promise.resolve(result)
  }) as typeof React.act
}

// Mock React.act for production builds
if (typeof global.React.act === 'undefined') {
  global.React.act = ((callback: () => any) => {
    const result = callback()
    return result instanceof Promise ? result : Promise.resolve(result)
  }) as typeof React.act
}

// Additional fallback for production builds
if (!global.React.act) {
  global.React.act = ((callback: () => any) => {
    const result = callback()
    return result instanceof Promise ? result : Promise.resolve(result)
  }) as typeof React.act
}

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props)
  },
}))

// Mock environment variables
vi.mock('@/lib/config', () => ({
  GOOGLE_SHEETS_ID: 'test-sheet-id',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
  GOOGLE_PRIVATE_KEY: 'test-private-key',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()
