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
  const [isShelfPinned, setIsShelfPinned] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggleShelf = () => {
    setIsShelfOpen(!isShelfOpen)
  }

  const handleCloseShelf = () => {
    if (!isShelfPinned) {
      setIsShelfOpen(false)
    }
  }

  const handleTogglePin = () => {
    if (isShelfPinned) {
      // When unpinning, also close the shelf
      setIsShelfPinned(false)
      setIsShelfOpen(false)
    } else {
      // When pinning, open and pin the shelf
      setIsShelfPinned(true)
      setIsShelfOpen(true)
    }
  }

  const handleToggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <Layout isShelfPinned={isShelfPinned}>
      <Outlet />

      <FloatingToggle
        isShelfOpen={isShelfOpen}
        isShelfPinned={isShelfPinned}
        onClick={() => {
          if (isShelfPinned) {
            handleToggleShelf()
            handleTogglePin()
          } else {
            handleToggleShelf()
          }
        }}
        title="Open Component List"
        type="shelf"
      />
      <FloatingToggle
        isShelfOpen={isShelfOpen}
        isShelfPinned={isShelfPinned}
        onClick={handleToggleTheme}
        theme={resolvedTheme}
        title="Toggle Theme"
        type="theme"
      />
      <FloatingToggle
        isShelfOpen={isShelfOpen}
        isShelfPinned={isShelfPinned}
        onClick={handleTogglePin}
        title={isShelfPinned ? 'Unpin and close shelf' : 'Pin shelf'}
        type="pin"
      />

      <Shelf
        isOpen={isShelfOpen}
        onClose={handleCloseShelf}
        isPinned={isShelfPinned}
      >
        <Sidebar components={components} />
      </Shelf>
    </Layout>
  )
}
