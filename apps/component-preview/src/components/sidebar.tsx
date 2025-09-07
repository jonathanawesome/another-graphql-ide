import { ComponentVariant } from '../types'
import { DiscoveredComponent } from '../utils/discovery'

import * as styles from './sidebar.css'

interface SidebarProps {
  components: DiscoveredComponent[]
  selectedId: string | null
  selectedVariant: string | null
  onSelect: (id: string, variantName?: string) => void
}

export function Sidebar({
  components,
  selectedId,
  selectedVariant,
  onSelect,
}: SidebarProps) {
  const grouped = components.reduce(
    (acc, comp) => {
      if (!acc[comp.category]) {
        acc[comp.category] = []
      }
      acc[comp.category].push(comp)
      return acc
    },
    {} as Record<string, DiscoveredComponent[]>
  )

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>Component Preview</h1>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className={styles.category}>
          <h2 className={styles.categoryTitle}>{category}</h2>
          <ul className={styles.componentList}>
            {items.map(item => (
              <li key={item.id} className={styles.componentItem}>
                <button
                  className={styles.componentButton}
                  data-active={selectedId === item.id && !selectedVariant}
                  onClick={() => onSelect(item.id)}
                >
                  {item.name}
                </button>
                {item.module.default.variants && (
                  <ul className={styles.variantList}>
                    {item.module.default.variants.map(
                      (variant: ComponentVariant) => (
                        <li key={variant.name}>
                          <button
                            className={styles.variantButton}
                            data-active={
                              selectedId === item.id &&
                              selectedVariant === variant.name
                            }
                            onClick={() => onSelect(item.id, variant.name)}
                          >
                            {variant.name}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
