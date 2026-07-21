import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../utility-components/previews/components'

import { ResponseHeader } from './response-header'

export const nav: NavPath = 'Panes/Response Header'

export const Example = createPreview(() => (
  <DemoGrid>
    <ResponseHeader />
  </DemoGrid>
))
