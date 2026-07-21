import { ThemeProvider, useTheme } from '@another-graphql-ide/react/style'
import { useEffect } from 'react'
import type { FoundryProvider } from 'react-foundry'

// Drives the design-system theme from foundry's toolbar toggle. Our
// ThemeProvider has no live mode prop (only defaultTheme, read once), but the
// context exposes setTheme, so we push foundry's resolved mode into it. No
// design-system change needed.
function SyncTheme({ mode }: { mode: 'light' | 'dark' }) {
  const { setTheme } = useTheme()
  useEffect(() => setTheme(mode), [mode, setTheme])
  return null
}

export const Provider: FoundryProvider = ({ children, theme }) => (
  <ThemeProvider>
    <SyncTheme mode={theme} />
    {children}
  </ThemeProvider>
)
