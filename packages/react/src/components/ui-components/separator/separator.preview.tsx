import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../utility-components/previews/components'

import { Separator } from './separator'

export const nav: NavPath = 'UI Components/Separator'

export const Vertical = createPreview(() => (
  <Separator orientation="vertical" />
))

export const Horizontal = createPreview(() => (
  <Separator orientation="horizontal" />
))

export const VerticalAndHorizontal = createPreview({
  label: 'Vertical & Horizontal',
  render: () => (
    <DemoGrid>
      <div style={{ height: 200, width: 200 }}>
        <Separator orientation="horizontal" />
        <Separator orientation="vertical" />
      </div>
    </DemoGrid>
  ),
})
