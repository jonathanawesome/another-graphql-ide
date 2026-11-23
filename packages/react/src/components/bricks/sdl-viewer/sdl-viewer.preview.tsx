import { createPreview, type NavPath } from 'react-foundry'

import { makeSupergraph, subgraphSdl } from './__fixtures__/sdl'
import { SdlViewer } from './sdl-viewer'

export const nav: NavPath = 'Bricks/SDL Viewer'

// The viewer fills its parent, so previews get a bounded box to render into.
const Frame = ({ children }: React.PropsWithChildren) => (
  <div style={{ height: 560, width: '100%' }}>{children}</div>
)

export const Subgraph = createPreview({
  label: 'Subgraph SDL',
  controls: { format: { type: 'boolean', default: false } },
  render: values => (
    <Frame>
      <SdlViewer sdl={subgraphSdl} format={values.format} frame="bordered" />
    </Frame>
  ),
})

// About 4,000 types: tens of thousands of lines with long @join__field lines.
const supergraph = makeSupergraph(4000)

export const LargeSupergraph = createPreview({
  label: 'Large supergraph',
  render: () => (
    <Frame>
      <SdlViewer sdl={supergraph} frame="bordered" />
    </Frame>
  ),
})
