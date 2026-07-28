import type { Theme } from '@another-graphql-ide/state'
import { lightTheme, darkTheme } from '@another-graphql-ide/style'
import { createContext, useEffect, useState, type ReactNode } from 'react'

// Direct import, not the ../state barrel: AGIProvider renders ThemeProvider, so
// going through the barrel would make the two files circular.
import { useAppStore } from '../state/use-app-store'

export type { Theme }

export type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: ReactNode
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves the stored theme preference against the OS and puts the matching
 * class on the document.
 *
 * The preference itself lives in the settings slice with every other
 * preference, persisted under one key and validated on the way back in. What
 * stays here is the part that needs a DOM: reading `prefers-color-scheme` and
 * swapping the class. Keeping that split means the state package never grows a
 * browser dependency.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useAppStore.use.theme()
  const setTheme = useAppStore.use.setTheme()

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return getSystemTheme()
  })

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const mediaQuery = matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: { matches: boolean }) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove(lightTheme, darkTheme)

    // Add the appropriate theme class
    if (resolvedTheme === 'dark') {
      root.classList.add(darkTheme)
    } else {
      root.classList.add(lightTheme)
    }
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
