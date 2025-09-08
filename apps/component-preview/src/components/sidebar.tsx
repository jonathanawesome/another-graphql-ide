import { useState } from 'react'

import { IconButton } from '../../../../packages/react/src/ui-components/icon-button/icon-button'
import { ComponentVariant } from '../types'
import { DiscoveredComponent } from '../utils/discovery'

import * as styles from './sidebar.css'

interface SidebarProps {
  components: DiscoveredComponent[]
  selectedId: string | null
  selectedItem: string | null
  selectedType: 'variant' | 'demo' | null
  onSelect: (id: string, itemName: string, type: 'variant' | 'demo') => void
}

export function Sidebar({
  components,
  selectedId,
  selectedItem,
  selectedType,
  onSelect,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

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
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className={styles.category}>
          <h2 className={styles.categoryTitle}>{category}</h2>
          <ul className={styles.componentList}>
            {items.map(item => {
              const preview = item.module?.default
              if (!preview) return null

              const hasVariants =
                preview.variants && preview.variants.length > 0
              const hasDemos = preview.demos && preview.demos.length > 0

              const variantsSectionId = `${item.id}-variants`
              const demosSectionId = `${item.id}-demos`
              const isVariantsExpanded = expandedSections.has(variantsSectionId)
              const isDemosExpanded = expandedSections.has(demosSectionId)

              return (
                <li key={item.id} className={styles.componentItem}>
                  <div className={styles.componentTitle}>{item.name}</div>

                  {/* Variants Section */}
                  {hasVariants && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <IconButton
                          action={() => toggleExpanded(variantsSectionId)}
                          iconName="Caret"
                          rotate={isVariantsExpanded ? '90' : undefined}
                          size="mini"
                          title="Caret"
                          aria-expanded={isVariantsExpanded}
                          aria-controls={`variants-list-${item.id}`}
                        />
                        <button
                          onClick={() => toggleExpanded(variantsSectionId)}
                        >
                          Variants
                        </button>
                      </div>
                      {isVariantsExpanded && (
                        <ul
                          className={styles.sectionList}
                          id={`variants-list-${item.id}`}
                          role="group"
                        >
                          {preview.variants?.map(
                            (variant: ComponentVariant) => (
                              <li
                                key={variant.name}
                                className={styles.sectionItem}
                              >
                                <div className={styles.treeItem}>
                                  <button
                                    className={styles.itemButton}
                                    data-active={
                                      selectedId === item.id &&
                                      selectedItem === variant.name &&
                                      selectedType === 'variant'
                                    }
                                    onClick={() =>
                                      onSelect(item.id, variant.name, 'variant')
                                    }
                                  >
                                    {variant.name}
                                  </button>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Demos Section */}
                  {hasDemos && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <IconButton
                          action={() => toggleExpanded(demosSectionId)}
                          iconName="Caret"
                          rotate={isDemosExpanded ? '90' : undefined}
                          size="mini"
                          title="Caret"
                          aria-expanded={isDemosExpanded}
                          aria-controls={`demos-list-${item.id}`}
                        />
                        <button onClick={() => toggleExpanded(demosSectionId)}>
                          Demos
                        </button>
                      </div>
                      {isDemosExpanded && (
                        <ul
                          className={styles.sectionList}
                          id={`demos-list-${item.id}`}
                          role="group"
                        >
                          {preview.demos?.map(demo => (
                            <li key={demo.name} className={styles.sectionItem}>
                              <div className={styles.treeItem}>
                                <button
                                  className={styles.itemButton}
                                  data-active={
                                    selectedId === item.id &&
                                    selectedItem === demo.name &&
                                    selectedType === 'demo'
                                  }
                                  onClick={() =>
                                    onSelect(item.id, demo.name, 'demo')
                                  }
                                >
                                  {demo.name}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </aside>
  )
}
