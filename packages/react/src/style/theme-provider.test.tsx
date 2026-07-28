import type { AppState } from '@another-graphql-ide/state'
import { darkTheme, lightTheme } from '@another-graphql-ide/style'
import { act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoreApi } from 'zustand/vanilla'

import { AGIProvider } from '../state/agi-provider'
import { useAppStore } from '../state/use-app-store'
import { createTestStore } from '../test-utils/render-with-provider'

import { ThemeProvider } from './theme-provider'

/** jsdom has no matchMedia, and the provider asks it for the system theme. */
const systemPrefers = (scheme: 'light' | 'dark') => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: scheme === 'dark',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
}

// theme={false} so AGIProvider supplies only the store: this file is testing the
// ThemeProvider it would otherwise have rendered for us.
const renderThemed = (
  children: ReactNode,
  store: StoreApi<AppState> = createTestStore()
) => ({
  store,
  ...render(
    <AGIProvider store={store} theme={false}>
      <ThemeProvider>{children}</ThemeProvider>
    </AGIProvider>
  ),
})

const rootClasses = () => document.documentElement.className

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    systemPrefers('light')
  })

  it('follows the OS while the preference is system', () => {
    systemPrefers('dark')
    renderThemed('child')

    expect(rootClasses()).toContain(darkTheme)
  })

  // The preference lives in the store, so anything holding the store can drive
  // the theme, which is how foundry pushes its toolbar toggle in.
  it('takes an explicit preference from the store', () => {
    const { store } = renderThemed('child')
    expect(rootClasses()).toContain(lightTheme)

    act(() => store.setState({ theme: 'dark' }))

    expect(rootClasses()).toContain(darkTheme)
    expect(rootClasses()).not.toContain(lightTheme)
  })

  it('writes the preference back through the context', () => {
    let setTheme: ((theme: 'dark') => void) | undefined

    const Probe = () => {
      setTheme = useAppStore.use.setTheme()
      return null
    }

    const { store } = renderThemed(<Probe />)
    act(() => setTheme?.('dark'))

    expect(store.getState().theme).toBe('dark')
    expect(rootClasses()).toContain(darkTheme)
  })

  it('is supplied by AGIProvider unless opted out', () => {
    render(
      <AGIProvider store={createTestStore({ theme: 'dark' })}>
        child
      </AGIProvider>
    )

    expect(rootClasses()).toContain(darkTheme)
  })
})
