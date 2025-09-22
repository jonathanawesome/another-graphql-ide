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
          { name: 'BookOpenText', size: 'mini', label: 'BookOpenText' },
          { name: 'Caret', size: 'mini', label: 'Caret' },
          { name: 'Combine', size: 'mini', label: 'Combine' },
          { name: 'Settings2', size: 'mini', label: 'Settings2' },
        ],
      },
    },
  ],
  demos: [
    {
      name: 'Example',
      render: () => (
        <IconButtonGroup
          icons={[
            { name: 'BookOpenText', size: 'mini', label: 'BookOpenText' },
            { name: 'Caret', size: 'mini', label: 'Caret' },
            { name: 'Combine', size: 'mini', label: 'Combine' },
            { name: 'Settings2', size: 'mini', label: 'Settings2' },
          ]}
        />
      ),
    },
  ],
})

export default preview
