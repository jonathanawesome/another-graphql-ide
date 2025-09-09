import { ThemeProvider, useTheme } from '@another-graphql-ide/style'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { FloatingToggle } from '../components/floating-toggle'
import { Layout } from '../components/layout'
import { Shelf } from '../components/shelf'
import { Sidebar } from '../components/sidebar'
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
  const [isShelfOpen, setIsShelfOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggleShelf = () => {
    setIsShelfOpen(!isShelfOpen)
  }

  const handleCloseShelf = () => {
    setIsShelfOpen(false)
  }

  const handleToggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <Layout>
      <Outlet />

      <FloatingToggle
        onClick={handleToggleShelf}
        title="Open Component List"
        type="shelf"
      />
      <FloatingToggle
        onClick={handleToggleTheme}
        theme={resolvedTheme}
        title="Toggle Theme"
        type="theme"
      />

      <Shelf isOpen={isShelfOpen} onClose={handleCloseShelf}>
        <Sidebar components={components} />
      </Shelf>
    </Layout>
  )
}