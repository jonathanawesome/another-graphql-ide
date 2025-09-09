/* eslint-disable @typescript-eslint/only-throw-error */
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo } from 'react'

import { Preview } from '../components/preview'
import { discoverComponents } from '../utils/discovery'

export const Route = createFileRoute('/$componentId/demo/$demoName')({
  loader: ({ params }) => {
    const components = discoverComponents()
    const component = components.find(c => c.id === params.componentId)

    if (!component) {
      throw redirect({ to: '/' })
    }

    if (!component.demos) {
      throw redirect({ to: '/' })
    }

    const demo = component.demos.find(d => d.name === params.demoName)
    if (!demo) {
      throw redirect({ to: '/' })
    }

    return { component, demo }
  },
  component: DemoRoute,
})

function DemoRoute() {
  const { componentId, demoName } = Route.useParams()
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
    <Preview preview={preview} selectedItem={demoName} selectedType="demo" />
  )
}
