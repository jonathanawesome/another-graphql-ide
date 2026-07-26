import { darkTheme, lightTheme } from '@another-graphql-ide/style'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useAppStore } = await import('../state')
const { ThemeProvider } = await import('./theme-provider')

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

const rootClasses = () => document.documentElement.className

describe('ThemeProvider', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
    document.documentElement.className = ''
    systemPrefers('light')
  })

  it('follows the OS while the preference is system', () => {
    systemPrefers('dark')
    render(<ThemeProvider>child</ThemeProvider>)

    expect(rootClasses()).toContain(darkTheme)
  })

  // The preference now lives in the store, so anything holding the store can
  // drive the theme, which is how foundry pushes its toolbar toggle in.
  it('takes an explicit preference from the store', () => {
    render(<ThemeProvider>child</ThemeProvider>)
    expect(rootClasses()).toContain(lightTheme)

    act(() => useAppStore.setState({ theme: 'dark' }))

    expect(rootClasses()).toContain(darkTheme)
    expect(rootClasses()).not.toContain(lightTheme)
  })

  it('writes the preference back through the context', () => {
    let setTheme: ((theme: 'dark') => void) | undefined

    const Probe = () => {
      setTheme = useAppStore.use.setTheme()
      return null
    }

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )
    act(() => setTheme?.('dark'))

    expect(useAppStore.getState().theme).toBe('dark')
    expect(rootClasses()).toContain(darkTheme)
  })
})
