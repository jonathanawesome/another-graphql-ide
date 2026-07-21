import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { AppNavigationItem } from './app-navigation-item'

export const nav: NavPath = 'UI Components/App Navigation Item'

export const AllVariants = createPreview({
  label: 'All Variants',
  render: () => (
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
  ),
})
