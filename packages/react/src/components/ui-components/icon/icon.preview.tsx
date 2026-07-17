import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Icon, type IconNames, type IconProps } from './icon'
import { IconMap } from './icon-map'

const preview = createPreview<IconProps>({
  title: 'Icon',
  component: Icon,
  category: 'UI Components',
  variants: [
    { name: 'Default', props: { name: 'BookOpenText' } },
    { name: 'Small Size', props: { name: 'Gear', size: 'small' } },
    { name: 'Medium Size', props: { name: 'Gear', size: 'medium' } },
    { name: 'With Rotation', props: { name: 'Caret', rotate: '90' } },
  ],
  demos: [
    {
      name: 'All Icons Grid',
      render: () => (
        <DemoGrid>
          {Object.keys(IconMap).map(name => (
            <DemoGridItem key={name}>
              <Icon name={name as IconNames} size="medium" />
              <span>{name}</span>
            </DemoGridItem>
          ))}
        </DemoGrid>
      ),
    },
    {
      name: 'Size Comparison',
      render: () => (
        <DemoGrid>
          <Icon name="Gear" size="small" />
          <span>Small</span>

          <Icon name="Gear" size="medium" />
          <span>Medium</span>

          <Icon name="Gear" size="large" />
          <span>Large</span>
        </DemoGrid>
      ),
    },
    {
      name: 'Rotation Examples',
      render: () => (
        <DemoGrid>
          <Icon name="Caret" />
          <span style={{ fontSize: '12px' }}>0°</span>

          <Icon name="Caret" rotate="90" />
          <span style={{ fontSize: '12px' }}>90°</span>

          <Icon name="Caret" rotate="180" />
          <span style={{ fontSize: '12px' }}>180°</span>

          <Icon name="Caret" rotate="270" />
          <span style={{ fontSize: '12px' }}>270°</span>
        </DemoGrid>
      ),
    },
    {
      name: 'Interface Examples',
      render: () => (
        <DemoGrid>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Search" size="small" />
            <span>Search for components...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Settings2" size="small" />
            <span>Settings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Copy" size="small" />
            <span>Copy to clipboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Play" size="small" />
            <span>Run query</span>
          </div>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
