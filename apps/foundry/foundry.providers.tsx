import { AGIProvider, useAppStore } from '@another-graphql-ide/react/state'
import { createAGIStore } from '@another-graphql-ide/state'
import { useEffect } from 'react'
import type { FoundryProvider } from 'react-foundry'

// Created outside React because foundry renders ComponentLanding instead of
// Preview when a nav group is selected, which unmounts this provider. A store
// held in state would be discarded on the way through a group header.
const store = createAGIStore()

// Drives the design-system theme from foundry's toolbar toggle. AGIProvider
// supplies the ThemeProvider; the store is what the toggle writes to.
function SyncTheme({ mode }: { mode: 'light' | 'dark' }) {
  const setTheme = useAppStore.use.setTheme()
  useEffect(() => setTheme(mode), [mode, setTheme])
  return null
}

export const Provider: FoundryProvider = ({ children, theme }) => (
  <AGIProvider store={store}>
    <SyncTheme mode={theme} />
    {children}
  </AGIProvider>
)
