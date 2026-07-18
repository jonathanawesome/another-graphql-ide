import { ThemeProvider } from '@another-graphql-ide/react/style'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useMemo } from 'react'

import { Layout } from '../components/layout'
import { Navigation } from '../components/navigation'
import { Shelf } from '../components/shelf'
import { useUIStore } from '../state'
import { discoverComponents } from '../utils/discovery'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  )
}

function RootContent() {
  const components = useMemo(() => discoverComponents(), [])
  const { isShelfPinned } = useUIStore()

  return (
    <Layout isShelfPinned={isShelfPinned}>
      <Outlet />

      <Navigation />

      <Shelf components={components} />
    </Layout>
  )
}
