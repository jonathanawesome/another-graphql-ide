import { ComponentType, ReactElement } from 'react'

export type ComponentVariant = {
  name: string
  props: Record<string, unknown>
}

export type ComponentDemo = {
  name: string
  render: () => ReactElement
}

export type ComponentPreview = {
  title: string
  component: ComponentType<Record<string, unknown>>
  variants?: ComponentVariant[]
  demos?: ComponentDemo[]
  category?: string
}

export type PreviewModule = {
  default: ComponentPreview
}
