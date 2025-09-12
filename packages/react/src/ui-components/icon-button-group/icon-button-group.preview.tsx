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
          { name: 'BookOpenText', size: 'mini', title: 'BookOpenText' },
          { name: 'Caret', size: 'mini', title: 'Caret' },
          { name: 'Combine', size: 'mini', title: 'Combine' },
          { name: 'Settings2', size: 'mini', title: 'Settings2' },
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
            { name: 'BookOpenText', size: 'mini', title: 'BookOpenText' },
            { name: 'Caret', size: 'mini', title: 'Caret' },
            { name: 'Combine', size: 'mini', title: 'Combine' },
            { name: 'Settings2', size: 'mini', title: 'Settings2' },
          ]}
        />
      ),
    },
  ],
})

export default preview
