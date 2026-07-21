import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { IconButton } from './icon-button'

export const nav: NavPath = 'UI Components/Icon Button'

export const Default = createPreview(() => (
  <IconButton name="BowArrow" label="BowArrow" />
))

export const Active = createPreview(() => (
  <IconButton name="BowArrow" label="BowArrow" state="active" />
))

export const Highlight = createPreview(() => (
  <IconButton name="BowArrow" label="BowArrow" state="highlight" />
))

export const All = createPreview(() => (
  <DemoGrid>
    <DemoGrid>
      <DemoGridItem>
        <IconButton
          ghost={true}
          label="BowArrow ghost"
          name="BowArrow"
          size="large"
        />
        <span>large - ghost</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={true}
          label="BowArrow ghost"
          name="BowArrow"
          size="medium"
        />
        <span>medium - ghost</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={true}
          label="BowArrow ghost"
          name="BowArrow"
          size="small"
        />
        <span>small - ghost</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={true}
          label="BowArrow ghost"
          name="BowArrow"
          size="mini"
        />
        <span>mini - ghost</span>
      </DemoGridItem>
    </DemoGrid>
    <DemoGrid>
      <DemoGridItem>
        <IconButton
          ghost={false}
          label="BowArrow"
          name="BowArrow"
          size="large"
        />
        <span>large</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={false}
          label="BowArrow"
          name="BowArrow"
          size="medium"
        />
        <span>medium</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={false}
          label="BowArrow"
          name="BowArrow"
          size="small"
        />
        <span>small</span>
      </DemoGridItem>
      <DemoGridItem>
        <IconButton
          ghost={false}
          label="BowArrow"
          name="BowArrow"
          size="mini"
        />
        <span>mini</span>
      </DemoGridItem>
    </DemoGrid>
  </DemoGrid>
))
