import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { TabGroupItem, type TabGroupItemProps } from './tab-group-item'

const preview = createPreview<TabGroupItemProps>({
  title: 'TabGroupItem',
  component: TabGroupItem,
  category: 'UI Components',
  variants: [
    {
      name: 'Default',
      props: { active: false, text: 'Tab Group Item' },
    },
    {
      name: 'Active',
      props: { active: true, text: 'Tab Group Item' },
    },
    {
      name: 'With Pill',
      props: { active: true, text: 'Tab Group Item', pill: { text: '123' } },
    },
    {
      name: 'With Action',
      props: {
        active: true,
        text: 'Tab Group Item',
        actionIconButton: { iconName: 'X', title: 'X', size: 'mini' },
      },
    },
  ],
  demos: [
    {
      name: 'Default & Active',
      render: () => (
        <DemoGrid>
          <TabGroupItem active={false} text="Tab Group Item" />
          <TabGroupItem active text="Tab Group Item" />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
