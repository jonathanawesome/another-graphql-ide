import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import {
  AppNavigationItem,
  AppNavigationItemProps,
} from './app-navigation-item'

const preview = createPreview<AppNavigationItemProps>({
  title: 'AppNavigationItem',
  component: AppNavigationItem,
  category: 'Navigation Components',
  demos: [
    {
      name: 'All Variants',
      render: () => {
        return (
          <DemoGrid>
            <DemoGridItem>
              <AppNavigationItem
                active={false}
                icon={{
                  iconName: 'Compass',
                  size: 'large',
                  title: 'Compass',
                }}
                orientation="vertical"
                text="Vertical default"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={true}
                icon={{
                  iconName: 'Compass',
                  size: 'large',
                  state: 'active',
                  title: 'Compass',
                }}
                orientation="vertical"
                text="Vertical active"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={false}
                icon={{
                  iconName: 'Compass',
                  size: 'small',
                  title: 'Compass',
                }}
                orientation="horizontal"
                text="Horizontal default"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={true}
                icon={{
                  iconName: 'Compass',
                  size: 'small',
                  state: 'active',
                  title: 'Compass',
                }}
                orientation="horizontal"
                text="Horizontal active"
              />
            </DemoGridItem>
          </DemoGrid>
        )
      },
    },
  ],
})

export default preview
