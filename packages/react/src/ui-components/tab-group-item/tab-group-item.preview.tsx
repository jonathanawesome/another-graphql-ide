import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { TabGroupItem, type TabGroupItemProps } from './tab-group-item'

const action = (name: string) => {
  // eslint-disable-next-line no-console
  console.log(`TabGroupItem clicked: ${name}`)
}

const preview = createPreview<TabGroupItemProps>({
  title: 'TabGroupItem',
  component: TabGroupItem,
  category: 'UI Components',
  variants: [
    {
      name: 'Default',
      props: {
        action: () => action('Tab Group Item'),
        active: false,
        text: 'Tab Group Item',
      },
    },
    {
      name: 'Active',
      props: {
        action: () => action('Tab Group Item'),
        active: true,
        text: 'Tab Group Item',
      },
    },
    {
      name: 'With Pill',
      props: {
        action: () => action('Tab Group Item'),
        active: true,
        text: 'Tab Group Item',
        pill: { text: '123' },
      },
    },
    {
      name: 'With Action Icon',
      props: {
        action: () => action('Tab Group Item'),
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
          <TabGroupItem
            action={() => action('Tab Group Item')}
            active={false}
            text="Tab Group Item"
          />
          <TabGroupItem
            action={() => action('Tab Group Item')}
            active
            text="Tab Group Item"
          />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
