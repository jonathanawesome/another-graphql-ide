import { createPreview } from '@another-graphql-ide/shared'

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
      name: 'with action button',
      render: () => (
        <Tabs
          items={[
            {
              name: 'tab1',
              content: <div>Content1</div>,
              trigger: {
                text: 'OperationName',
                actionButton: {
                  ghost: true,
                  name: 'X',
                  label: 'X',
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
                actionButton: {
                  ghost: true,
                  name: 'X',
                  label: 'X',
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
                actionButton: {
                  ghost: true,
                  name: 'X',
                  label: 'X',
                  size: 'mini',
                  action: () => alert('Hi from Tab3'),
                },
              },
            },
          ]}
          label="Demo Tabs"
          defaultActiveTab="trigger1"
        />
      ),
    },
    {
      name: 'with pills',
      render: () => (
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
      ),
    },
  ],
})

export default preview
