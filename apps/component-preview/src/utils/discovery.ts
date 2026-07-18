import type { ComponentType, ReactElement } from 'react'

type PreviewModule = {
  default: {
    title: string
    component: ComponentType<Record<string, unknown>>
    category?: string
    variants?: {
      name: string
      props: Record<string, unknown>
    }[]
    demos?: {
      name: string
      render: () => ReactElement
    }[]
  }
}

const previewModules = import.meta.glob<PreviewModule>(
  '../../../../packages/*/src/**/*.preview.tsx',
  { eager: true }
)

export type DiscoveredComponent = {
  id: string
  path: string
  title: string
  component: ComponentType<Record<string, unknown>>
  category: string
  variants?: {
    name: string
    props: Record<string, unknown>
  }[]
  demos?: {
    name: string
    render: () => ReactElement
  }[]
  name: string
}

export function discoverComponents(): DiscoveredComponent[] {
  const components: DiscoveredComponent[] = []

  for (const [path, previewModule] of Object.entries(previewModules)) {
    const pathParts = path.split('/')
    // Find the index of 'packages' in the path and get the next part as package name
    const packagesIndex = pathParts.indexOf('packages')
    const packageName =
      (packagesIndex !== -1 ? pathParts[packagesIndex + 1] : undefined) ??
      'unknown'
    const fileName = (pathParts.at(-1) ?? path).replace('.preview.tsx', '')

    components.push({
      id: fileName,
      path,
      title: previewModule.default.title,
      component: previewModule.default.component,
      category: previewModule.default.category ?? packageName,
      variants: previewModule.default.variants,
      demos: previewModule.default.demos,
      name: previewModule.default.title || fileName,
    })
  }

  return components.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.name.localeCompare(b.name)
  })
}
