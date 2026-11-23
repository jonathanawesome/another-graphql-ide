import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// with vitest globals disabled, testing-library's auto-cleanup never registers,
// so rendered trees leak between tests. register it explicitly instead.
afterEach(cleanup)

// jsdom has no working matchMedia, and AGIProvider supplies a ThemeProvider
// that reads it on mount. Files needing a specific response stub their own.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
}))

// jsdom has no layout, so Range lacks the rect methods CodeMirror measures
// with when it scrolls a position into view.
const emptyRect = () => new DOMRect()
Range.prototype.getBoundingClientRect = emptyRect
Range.prototype.getClientRects = () => Object.assign([], { item: () => null })
