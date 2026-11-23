import { themeContract } from '@another-graphql-ide/style'
import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Resizer } from './resizer'

export const nav: NavPath = 'Primitives/Resizer'

// Theme-aware demo panes so the preview reads correctly in light and dark.
const paneBase: React.CSSProperties = {
  padding: '20px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: themeContract.text.primary,
}
const firstPane: React.CSSProperties = {
  ...paneBase,
  backgroundColor: themeContract.bg.inset,
}
const secondPane: React.CSSProperties = {
  ...paneBase,
  backgroundColor: themeContract.bg.hover,
}

export const HorizontalResizer = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <div style={{ height: '400px' }}>
        <Resizer
          orientation="horizontal"
          firstPane={<div style={firstPane}>First Pane (Horizontal)</div>}
          secondPane={<div style={secondPane}>Second Pane (Horizontal)</div>}
        />
      </div>
    </DemoGridItem>
  </DemoGrid>
))

export const VerticalResizer = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <div style={{ height: '400px' }}>
        <Resizer
          orientation="vertical"
          firstPane={<div style={firstPane}>First Pane (Vertical)</div>}
          secondPane={<div style={secondPane}>Second Pane (Vertical)</div>}
        />
      </div>
    </DemoGridItem>
  </DemoGrid>
))

export const CustomSizeLimits = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <div style={{ height: '400px' }}>
        <Resizer
          orientation="horizontal"
          defaultSizePercent={30}
          minSizePercent={20}
          maxSizePercent={60}
          firstPane={
            <div style={{ ...firstPane, flexDirection: 'column' }}>
              <div>First Pane</div>
              <div
                style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}
              >
                Min: 20%, Max: 60%
              </div>
            </div>
          }
          secondPane={<div style={secondPane}>Second Pane</div>}
        />
      </div>
    </DemoGridItem>
  </DemoGrid>
))
