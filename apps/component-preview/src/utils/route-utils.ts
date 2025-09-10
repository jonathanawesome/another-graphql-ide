/* eslint-disable @typescript-eslint/only-throw-error */
import { redirect } from '@tanstack/react-router'
import { useMemo } from 'react'

import { DiscoveredComponent, discoverComponents } from '../utils/discovery'

/**
 * Get a component by ID from the discovered components
 */
export function getComponentById(
  componentId: string
): DiscoveredComponent | undefined {
  const components = discoverComponents()
  return components.find(c => c.id === componentId)
}

/**
 * Transform a DiscoveredComponent into the preview format expected by Preview component
 */
export function createPreviewFromComponent(
  component: DiscoveredComponent | undefined
) {
  if (!component) return null

  return {
    title: component.title,
    component: component.component,
    category: component.category,
    variants: component.variants,
    demos: component.demos,
  }
}

/**
 * Hook to get the preview data for a component
 */
export function usePreviewComponent(componentId: string) {
  const components = useMemo(() => discoverComponents(), [])
  const selectedComponent = components.find(c => c.id === componentId)
  return createPreviewFromComponent(selectedComponent)
}

/**
 * Generic loader factory for preview routes
 */
type PreviewType = 'variant' | 'demo'

export interface LoaderParams {
  componentId: string
  variantName?: string
  demoName?: string
}

export function createPreviewLoader<T extends PreviewType>(type: T) {
  return ({ params }: { params: LoaderParams }) => {
    const component = getComponentById(params.componentId)

    if (!component) {
      throw redirect({ to: '/' })
    }

    if (type === 'variant') {
      if (!component.variants) {
        throw redirect({ to: '/' })
      }

      const variant = component.variants.find(
        v => v.name === params.variantName
      )
      if (!variant) {
        throw redirect({ to: '/' })
      }

      return { component, variant }
    }

    if (type === 'demo') {
      if (!component.demos) {
        throw redirect({ to: '/' })
      }

      const demo = component.demos.find(d => d.name === params.demoName)
      if (!demo) {
        throw redirect({ to: '/' })
      }

      return { component, demo }
    }

    throw redirect({ to: '/' })
  }
}
