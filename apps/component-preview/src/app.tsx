import { useState, useMemo } from 'react'

import { Layout } from './components/layout'
import { Preview } from './components/preview'
import { Shelf } from './components/shelf'
import { ShelfToggle } from './components/shelf-toggle'
import { Sidebar } from './components/sidebar'
import { ThemeToggle } from './components/theme-toggle'
import { discoverComponents } from './utils/discovery'

export function App() {
  const components = useMemo(() => discoverComponents(), [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'variant' | 'demo' | null>(null)
  const [isShelfOpen, setIsShelfOpen] = useState(false)

  const selectedComponent = components.find(c => c.id === selectedId)
  const preview = selectedComponent?.module.default || null

  const handleSelect = (id: string, itemName: string, type: 'variant' | 'demo') => {
    setSelectedId(id)
    setSelectedItem(itemName)
    setSelectedType(type)
  }

  const handleToggleShelf = () => {
    setIsShelfOpen(!isShelfOpen)
  }

  const handleCloseShelf = () => {
    setIsShelfOpen(false)
  }

  return (
    <Layout>
      <Preview 
        preview={preview} 
        selectedItem={selectedItem}
        selectedType={selectedType}
      />

      <ShelfToggle onClick={handleToggleShelf} />

      <Shelf isOpen={isShelfOpen} onClose={handleCloseShelf}>
        <div style={{ marginBottom: '24px' }}>
          <ThemeToggle />
        </div>
        <Sidebar
          components={components}
          selectedId={selectedId}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onSelect={handleSelect}
        />
      </Shelf>
    </Layout>
  )
}
