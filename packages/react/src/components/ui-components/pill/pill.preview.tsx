import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Pill } from './pill'

export const nav: NavPath = 'UI Components/Pill'

export const Examples = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <Pill text="213" />
    </DemoGridItem>
    <DemoGridItem>
      <Pill text="243637" />
    </DemoGridItem>
    <DemoGridItem>
      <Pill text="Some Cool Pill" />
    </DemoGridItem>
    <DemoGridItem>
      <Pill text="987" />
    </DemoGridItem>
  </DemoGrid>
))
