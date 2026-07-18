import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// with vitest globals disabled, testing-library's auto-cleanup never registers,
// so rendered trees leak between tests. register it explicitly instead.
afterEach(cleanup)
