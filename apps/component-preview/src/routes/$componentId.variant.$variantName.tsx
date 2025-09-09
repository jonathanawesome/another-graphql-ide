/* eslint-disable @typescript-eslint/only-throw-error */
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo } from 'react'

import { Preview } from '../components/preview'
import { discoverComponents } from '../utils/discovery'

export const Route = createFileRoute('/$componentId/variant/$variantName')({
  loader: ({ params }) => {
    const components = discoverComponents()
    const component = components.find(c => c.id === params.componentId)

    if (!component) {
      throw redirect({ to: '/' })
    }

    if (!component.variants) {
      throw redirect({ to: '/' })
    }

    const variant = component.variants.find(v => v.name === params.variantName)
    if (!variant) {
      throw redirect({ to: '/' })
    }

    return { component, variant }
  },
  component: VariantRoute,
})

function VariantRoute() {
  const { componentId, variantName } = Route.useParams()
  const components = useMemo(() => discoverComponents(), [])
  const selectedComponent = components.find(c => c.id === componentId)
  const preview = selectedComponent ? {
    title: selectedComponent.title,
    component: selectedComponent.component,
    category: selectedComponent.category,
    variants: selectedComponent.variants,
    demos: selectedComponent.demos
  } : null

  return (
    <Preview
      preview={preview}
      selectedItem={variantName}
      selectedType="variant"
    />
  )
}
