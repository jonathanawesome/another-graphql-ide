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

    const preview = component.module?.default
    if (!preview?.variants) {
      throw redirect({ to: '/' })
    }

    const variant = preview.variants.find(v => v.name === params.variantName)
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
  const preview = selectedComponent?.module.default || null

  return (
    <Preview
      preview={preview}
      selectedItem={variantName}
      selectedType="variant"
    />
  )
}
