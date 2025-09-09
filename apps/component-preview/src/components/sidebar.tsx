import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'

import { Icon } from '../../../../packages/react/src/ui-components/icon/icon'
import { IconButton } from '../../../../packages/react/src/ui-components/icon-button/icon-button'
import { ComponentVariant } from '../types'
import { DiscoveredComponent } from '../utils/discovery'

import * as styles from './sidebar.css'

interface SidebarProps {
  components: DiscoveredComponent[]
}

const SectionHeader = ({
  action,
  title,
  isExpanded,
}: {
  action: () => void
  title: string
  isExpanded: boolean
}) => {
  return (
    <button
      className={styles.sectionHeader}
      onClick={action}
      data-active={isExpanded}
    >
      <Icon
        name="Chevron"
        rotate={isExpanded ? '90' : undefined}
        size="small"
      />
      {title}
    </button>
  )
}

// const SectionList = () => {
//   return (
//     <ul
//       className={styles.sectionList}
//       role="group"
//     >
//       {preview.demos?.map(demo => (
//         <li key={demo.name}>
//           <Link
//             to="/$componentId/demo/$demoName"
//             params={{
//               componentId: item.id,
//               demoName: demo.name,
//             }}
//             className={styles.itemButton}
//             data-active={componentId === item.id && demoName === demo.name}
//           >
//             {demo.name}
//           </Link>
//         </li>
//       ))}
//     </ul>
//   )
// }

export function Sidebar({ components }: SidebarProps) {
  const params = useParams({ strict: false })
  const componentId = 'componentId' in params ? params.componentId : null
  const variantName = 'variantName' in params ? params.variantName : null
  const demoName = 'demoName' in params ? params.demoName : null
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
                      <SectionHeader
                        action={() => toggleExpanded(variantsSectionId)}
                        isExpanded={isVariantsExpanded}
                        title="Variants"
                      />

                      {isVariantsExpanded && (
                        <ul
                          className={styles.sectionList}
                          id={`variants-list-${item.id}`}
                          role="group"
                        >
                          {preview.variants?.map(
                            (variant: ComponentVariant) => (
                              <li key={variant.name}>
                                <Link
                                  to="/$componentId/variant/$variantName"
                                  params={{
                                    componentId: item.id,
                                    variantName: variant.name,
                                  }}
                                  className={styles.itemButton}
                                  data-active={
                                    componentId === item.id &&
                                    variantName === variant.name
                                  }
                                >
                                  {variant.name}
                                </Link>
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
                      <SectionHeader
                        action={() => toggleExpanded(demosSectionId)}
                        isExpanded={isDemosExpanded}
                        title="Demos"
                      />

                      {isDemosExpanded && (
                        <ul
                          className={styles.sectionList}
                          id={`demos-list-${item.id}`}
                          role="group"
                        >
                          {preview.demos?.map(demo => (
                            <li key={demo.name}>
                              <Link
                                to="/$componentId/demo/$demoName"
                                params={{
                                  componentId: item.id,
                                  demoName: demo.name,
                                }}
                                className={styles.itemButton}
                                data-active={
                                  componentId === item.id &&
                                  demoName === demo.name
                                }
                              >
                                {demo.name}
                              </Link>
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
