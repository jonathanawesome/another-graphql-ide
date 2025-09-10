import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { Tabs, type TabsProps } from './tabs'

const preview = createPreview<TabsProps>({
  title: 'Tabs',
  component: Tabs,
  category: 'UI Components',
  variants: [
    {
      name: 'Default',
      props: {
        items: [
          {
            name: 'tab1',
            content: <div>Content1</div>,
            trigger: { text: 'trigger1' },
          },
          {
            name: 'tab2',
            content: <div>Content2</div>,
            trigger: { text: 'trigger2' },
          },
          {
            name: 'tab3',
            content: <div>Content3</div>,
            trigger: { text: 'trigger3' },
          },
        ],
        label: 'Demo Tabs',
        defaultActiveTab: 'trigger1',
      },
    },
  ],
  demos: [
    {
      name: 'Example',
      render: () => (
        <DemoGrid>
          <Tabs
            items={[
              {
                name: 'tab1',
                content: <div>Content1</div>,
                trigger: {
                  text: 'OperationName',
                  actionIconButton: {
                    iconName: 'X',
                    title: 'X',
                    size: 'mini',
                    action: () => alert('Hi from Tab1'),
                  },
                },
              },
              {
                name: 'tab2',
                content: <div>Content2</div>,
                trigger: {
                  text: 'Untitled',
                  actionIconButton: {
                    iconName: 'X',
                    title: 'X',
                    size: 'mini',
                    action: () => alert('Hi from Tab2'),
                  },
                },
              },
              {
                name: 'tab3',
                content: <div>Content3</div>,
                trigger: {
                  text: 'MyQuery',
                  actionIconButton: {
                    iconName: 'X',
                    title: 'X',
                    size: 'mini',
                    action: () => alert('Hi from Tab3'),
                  },
                },
              },
            ]}
            label="Demo Tabs"
            defaultActiveTab="trigger1"
          />
          <Tabs
            items={[
              {
                name: 'tab1',
                content: <div>Content1</div>,
                trigger: {
                  text: 'Query',
                  pill: { text: '234' },
                },
              },
              {
                name: 'tab2',
                content: <div>Content2</div>,
                trigger: {
                  text: 'Mutation',
                  pill: { text: '765' },
                },
              },
              {
                name: 'tab3',
                content: <div>Content3</div>,
                trigger: {
                  text: 'Subscription',
                  pill: { text: '99' },
                },
              },
            ]}
            label="Demo Tabs"
            defaultActiveTab="trigger1"
          />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
