import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../utility-components/previews/components'

import { AppNavigation } from './app-navigation'

export const nav: NavPath = 'Navigation/App Navigation'

export const Vertical = createPreview(() => (
  <AppNavigation orientation="vertical" />
))

export const Horizontal = createPreview(() => (
  <AppNavigation orientation="horizontal" />
))

export const VerticalAndHorizontal = createPreview({
  label: 'Vertical & Horizontal',
  render: () => (
    <DemoGrid>
      <AppNavigation orientation="horizontal" />
      <AppNavigation orientation="vertical" />
    </DemoGrid>
  ),
})
