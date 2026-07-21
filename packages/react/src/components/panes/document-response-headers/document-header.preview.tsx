import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../utility-components/previews/components'

import { DocumentHeader } from './document-header'

export const nav: NavPath = 'Panes/Document Header'

export const Example = createPreview(() => (
  <DemoGrid>
    <DocumentHeader />
  </DemoGrid>
))
