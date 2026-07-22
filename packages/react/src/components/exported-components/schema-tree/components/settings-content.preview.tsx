import { createPreview, type NavPath } from 'react-foundry'

import { DemoGrid } from '../../../utility-components/previews/components'

import { SettingsContent } from './settings-content'

export const nav: NavPath = 'Exported Components/Schema Tree Settings'

export const Example = createPreview(() => (
  <DemoGrid>
    <SettingsContent />
  </DemoGrid>
))
