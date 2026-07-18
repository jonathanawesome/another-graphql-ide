import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import type { AppNavigationItemProps } from './app-navigation-item'
import { AppNavigationItem } from './app-navigation-item'

const preview = createPreview<AppNavigationItemProps>({
  title: 'AppNavigationItem',
  component: AppNavigationItem,
  category: 'UI Components',
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
                  name: 'Compass',
                  size: 'large',
                  label: 'Compass',
                }}
                orientation="vertical"
                text="Vertical default"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={true}
                icon={{
                  name: 'Compass',
                  size: 'large',
                  state: 'active',
                  label: 'Compass',
                }}
                orientation="vertical"
                text="Vertical active"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={false}
                icon={{
                  name: 'Compass',
                  size: 'small',
                  label: 'Compass',
                }}
                orientation="horizontal"
                text="Horizontal default"
              />
            </DemoGridItem>
            <DemoGridItem>
              <AppNavigationItem
                active={true}
                icon={{
                  name: 'Compass',
                  size: 'small',
                  state: 'active',
                  label: 'Compass',
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
