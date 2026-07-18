import type { ComponentType, ReactElement } from 'react'

type TypedComponentPreview<TProps> = {
  title: string
  component: ComponentType<TProps>
  category?: string
  variants?: {
    name: string
    props: TProps
  }[]
  demos?: {
    name: string
    render: () => ReactElement
  }[]
}

/**
 * Creates a fully type-safe component preview.
 * The props in variants are automatically validated against the component's prop types.
 */
export function createPreview<TProps>(
  config: TypedComponentPreview<TProps>
): TypedComponentPreview<TProps> {
  return config
}
