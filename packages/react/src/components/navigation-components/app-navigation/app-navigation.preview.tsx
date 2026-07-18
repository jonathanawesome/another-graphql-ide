import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { AppNavigation, type AppNavigationProps } from './app-navigation'

const preview = createPreview<AppNavigationProps>({
  title: 'AppNavigation',
  component: AppNavigation,
  category: 'Navigation Components',
  variants: [
    {
      name: 'Vertical',
      props: { orientation: 'vertical' },
    },
    {
      name: 'Horizontal',
      props: { orientation: 'horizontal' },
    },
  ],
  demos: [
    {
      name: 'Vertical & Horizontal',
      render: () => (
        <DemoGrid>
          <AppNavigation orientation="horizontal" />
          <AppNavigation orientation="vertical" />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
