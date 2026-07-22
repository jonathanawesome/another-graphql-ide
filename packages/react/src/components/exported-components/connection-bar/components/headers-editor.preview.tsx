import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../../utility-components/previews/components'

import { HeadersEditor } from './headers-editor'

export const nav: NavPath = 'Exported Components/Headers Editor'

// Normally rendered inside the ConnectionBar headers popover. Standalone here to
// exercise both modes: key/value rows (add/remove) and the raw JSON toggle.
export const Example = createPreview(() => (
  <DemoGrid>
    <div style={{ width: 380 }}>
      <HeadersEditor />
    </div>
  </DemoGrid>
))
