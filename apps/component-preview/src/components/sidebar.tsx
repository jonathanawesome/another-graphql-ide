import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'

import { Icon } from '../../../../packages/react/src/ui-components/icon/icon'
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

export function Sidebar({ components }: SidebarProps) {
  const params = useParams({ strict: false })
  const routeComponentId = 'componentId' in params ? params.componentId : null
  const routeVariantName = 'variantName' in params ? params.variantName : null
  const routeDemoName = 'demoName' in params ? params.demoName : null
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
      {Object.entries(grouped).map(([category, discoveredComponents]) => {
        return (
          <div key={category} className={styles.category}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <ul className={styles.componentList}>
              {discoveredComponents.map(component => {
                const hasVariants =
                  component.variants && component.variants.length > 0
                const hasDemos = component.demos && component.demos.length > 0

                const variantsSectionId = `${component.id}-variants`
                const demosSectionId = `${component.id}-demos`
                const isVariantsExpanded =
                  expandedSections.has(variantsSectionId)
                const isDemosExpanded = expandedSections.has(demosSectionId)

                return (
                  <li key={component.id} className={styles.componentItem}>
                    <div className={styles.componentTitle}>
                      {component.name}
                    </div>

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
                            id={`variants-list-${component.id}`}
                            role="group"
                          >
                            {component.variants?.map(
                              (variant: ComponentVariant) => (
                                <li key={variant.name}>
                                  <Link
                                    to="/$componentId/variant/$variantName"
                                    params={{
                                      componentId: component.id,
                                      variantName: variant.name,
                                    }}
                                    className={styles.itemButton}
                                    data-active={
                                      routeComponentId === component.id &&
                                      routeVariantName === variant.name
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
                            id={`demos-list-${component.id}`}
                            role="group"
                          >
                            {component.demos?.map(demo => (
                              <li key={demo.name}>
                                <Link
                                  to="/$componentId/demo/$demoName"
                                  params={{
                                    componentId: component.id,
                                    demoName: demo.name,
                                  }}
                                  className={styles.itemButton}
                                  data-active={
                                    routeComponentId === component.id &&
                                    routeDemoName === demo.name
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
        )
      })}
    </aside>
  )
}
