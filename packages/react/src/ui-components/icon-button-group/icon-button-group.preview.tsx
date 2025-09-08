import { createPreview } from '@another-graphql-ide/shared'

import { IconButtonGroup, type IconButtonGroupProps } from './icon-button-group'

const preview = createPreview<IconButtonGroupProps>({
  title: 'IconButtonGroup',
  component: IconButtonGroup,
  category: 'UI Components',
  variants: [
    {
      name: 'default',
      props: {
        icons: [
          { iconName: 'BookOpenText', size: 'mini', title: 'BookOpenText' },
          { iconName: 'Caret', size: 'mini', title: 'Caret' },
          { iconName: 'Combine', size: 'mini', title: 'Combine' },
          { iconName: 'Settings2', size: 'mini', title: 'Settings2' },
        ],
      },
    },
  ],
})

export default preview
