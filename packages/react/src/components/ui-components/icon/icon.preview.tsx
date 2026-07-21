import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Icon, type IconNames } from './icon'
import { IconMap } from './icon-map'

export const nav: NavPath = 'UI Components/Icon'

export const Default = createPreview(() => <Icon name="BookOpenText" />)

export const SmallSize = createPreview(() => <Icon name="Gear" size="small" />)

export const MediumSize = createPreview(() => (
  <Icon name="Gear" size="medium" />
))

export const WithRotation = createPreview(() => (
  <Icon name="Caret" rotate="90" />
))

export const AllIconsGrid = createPreview(() => (
  <DemoGrid>
    {Object.keys(IconMap).map(name => (
      <DemoGridItem key={name}>
        <Icon name={name as IconNames} size="medium" />
        <span>{name}</span>
      </DemoGridItem>
    ))}
  </DemoGrid>
))

export const SizeComparison = createPreview(() => (
  <DemoGrid>
    <Icon name="Gear" size="small" />
    <span>Small</span>

    <Icon name="Gear" size="medium" />
    <span>Medium</span>

    <Icon name="Gear" size="large" />
    <span>Large</span>
  </DemoGrid>
))

export const RotationExamples = createPreview(() => (
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
))

export const InterfaceExamples = createPreview(() => (
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
))
