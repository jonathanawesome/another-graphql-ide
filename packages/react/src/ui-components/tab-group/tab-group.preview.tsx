import { createPreview } from '@another-graphql-ide/shared'

import { TabGroup, type TabGroupProps } from './tab-group'

const action = (name: string) => {
  // eslint-disable-next-line no-console
  console.log(`TabGroupItem clicked: ${name}`)
}

const preview = createPreview<TabGroupProps>({
  title: 'TabGroup',
  component: TabGroup,
  category: 'UI Components',
  demos: [
    {
      name: 'Example',
      render: () => (
        <TabGroup
          tabs={[
            {
              action: () => action('One'),
              active: true,
              text: 'One',
              pill: { text: '642' },
            },
            { action: () => action('Two'), text: 'Two' },
            { action: () => action('Three'), text: 'Three' },
            { action: () => action('Four'), text: 'Four' },
            { action: () => action('Five'), text: 'Five' },
          ]}
        />
      ),
    },
  ],
})

export default preview
