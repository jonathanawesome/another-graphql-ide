import { textStyles, themeContract } from '@another-graphql-ide/style'
import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { Button } from '../../primitives/button/button'

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

// Type links go nowhere real; the hash shows in the status bar on hover.
const typeHref = (name: string) =>
  /^[A-Z]/.test(name) &&
  !['String', 'Int', 'Float', 'Boolean', 'ID'].includes(name)
    ? `#types/${name}`
    : undefined

// Host content, loosely after the design: the brick only supplies the card.
const muted = { color: themeContract.text.tertiary }
const eyebrow = { ...textStyles.overline, ...muted }
const mono = { fontFamily: themeContract.fonts.mono }

const HoverContent = ({
  coordinate,
  data,
}: {
  coordinate: string
  data: ReturnType<typeof makeLineData>
}) => {
  const typeName = coordinate.split('.')[0] ?? coordinate
  const href = typeHref(typeName)
  const annotation = data.annotations.get(coordinate)
  const tag = data.tags.get(coordinate)
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <span style={eyebrow}>
        {coordinate.includes('.') ? 'Field' : 'Type'} · defined in users
        {tag ? ` · ${tag.label}` : ''}
      </span>
      <span style={mono}>{coordinate}</span>
      <span>
        {annotation?.ratio
          ? `In ${annotation.value} requests in the last 7 days.`
          : 'Not requested in the last 7 days.'}
        {annotation?.error &&
          ` ${annotation.error.replace(' errors', '')} of resolutions returned an error.`}
      </span>
      {href && <a href={href}>Open the type →</a>}
    </div>
  )
}

// Selection is the host's: the line below echoes what onSelect reported.
const Annotated = ({
  sdl,
  dim,
  revealTo,
}: {
  sdl: string
  dim: boolean
  revealTo: string
}) => {
  const [data] = useState(() => makeLineData(sdl))
  const [selected, setSelected] = useState<string>()
  const [reveal, setReveal] = useState<{ coordinate: string; nonce: number }>()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 8,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button
          text={`Reveal ${revealTo}`}
          label={`Reveal ${revealTo}`}
          action={() =>
            setReveal(last => ({
              coordinate: revealTo,
              nonce: (last?.nonce ?? 0) + 1,
            }))
          }
        />
        <code>selected: {selected ?? 'none'}</code>
      </div>
      <Frame>
        <SdlViewer
          sdl={sdl}
          annotations={data.annotations}
          annotationLabel="Requests"
          tags={data.tags}
          dimmed={dim ? data.dimmed : undefined}
          selected={selected}
          onSelect={setSelected}
          reveal={reveal}
          typeHref={typeHref}
          renderHover={coordinate => (
            <HoverContent coordinate={coordinate} data={data} />
          )}
          status={`${data.annotations.size.toLocaleString()} coordinates`}
          frame="bordered"
        />
      </Frame>
    </div>
  )
}

export const Annotations = createPreview({
  label: 'Annotations and tags',
  controls: { dim: { type: 'boolean', default: false } },
  render: values => (
    <Annotated sdl={subgraphSdl} dim={values.dim} revealTo="Role" />
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

export const LargeSupergraphAnnotated = createPreview({
  label: 'Large supergraph, annotated',
  controls: { dim: { type: 'boolean', default: false } },
  render: values => (
    <Annotated sdl={supergraph} dim={values.dim} revealTo="Type2000" />
  ),
})

const subgraphAnnotations = makeLineData(subgraphSdl).annotations

export const Loading = createPreview({
  label: 'Loading',
  controls: { loading: { type: 'boolean', default: true } },
  render: values => (
    <Frame>
      <SdlViewer
        sdl={values.loading ? '' : subgraphSdl}
        loading={values.loading}
        annotations={values.loading ? undefined : subgraphAnnotations}
        annotationLabel="Requests"
        status="Loaded"
        frame="bordered"
      />
    </Frame>
  ),
})

export const Empty = createPreview({
  label: 'Empty',
  render: () => (
    <Frame>
      <SdlViewer sdl="" status="No schema" frame="bordered" />
    </Frame>
  ),
})
