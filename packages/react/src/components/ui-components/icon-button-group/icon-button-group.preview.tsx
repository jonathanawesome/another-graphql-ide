import { createPreview, type NavPath } from 'react-foundry'

import { IconButtonGroup } from './icon-button-group'

export const nav: NavPath = 'UI Components/Icon Button Group'

export const Default = createPreview(() => (
  <IconButtonGroup
    icons={[
      { name: 'BookOpenText', size: 'mini', label: 'BookOpenText' },
      { name: 'Caret', size: 'mini', label: 'Caret' },
      { name: 'Combine', size: 'mini', label: 'Combine' },
      { name: 'Settings2', size: 'mini', label: 'Settings2' },
    ]}
  />
))

export const Example = createPreview(() => (
  <IconButtonGroup
    icons={[
      { name: 'BookOpenText', size: 'mini', label: 'BookOpenText' },
      { name: 'Caret', size: 'mini', label: 'Caret' },
      { name: 'Combine', size: 'mini', label: 'Combine' },
      { name: 'Settings2', size: 'mini', label: 'Settings2' },
    ]}
  />
))
