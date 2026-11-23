import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { makeLineData, makeSupergraph, subgraphSdl } from './__fixtures__/sdl'
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

// Selection is the host's: the footer echoes what onSelect reported.
const Annotated = ({ sdl, dim }: { sdl: string; dim: boolean }) => {
  const [data] = useState(() => makeLineData(sdl))
  const [selected, setSelected] = useState<string>()
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}
    >
      <Frame>
        <SdlViewer
          sdl={sdl}
          annotations={data.annotations}
          annotationLabel="Requests"
          tags={data.tags}
          dimmed={dim ? data.dimmed : undefined}
          selected={selected}
          onSelect={setSelected}
          frame="bordered"
        />
      </Frame>
      <code>selected: {selected ?? 'none'}</code>
    </div>
  )
}

export const Annotations = createPreview({
  label: 'Annotations and tags',
  controls: { dim: { type: 'boolean', default: false } },
  render: values => <Annotated sdl={subgraphSdl} dim={values.dim} />,
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

export const LargeSupergraphAnnotated = createPreview({
  label: 'Large supergraph, annotated',
  controls: { dim: { type: 'boolean', default: false } },
  render: values => <Annotated sdl={supergraph} dim={values.dim} />,
})
