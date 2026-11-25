import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { makeSupergraph, subgraphSdl } from '../sdl-viewer/__fixtures__/sdl'

import { editFields, reorderDefinitions } from './__fixtures__/edits'
import { SdlDiff, type SdlDiffProps, type SdlDiffResult } from './sdl-diff'

export const nav: NavPath = 'Bricks/SDL Diff'

// The brick fills its parent, so previews get a bounded box to render into.
// The line above it echoes what onResult reported.
const Framed = (props: SdlDiffProps) => {
  const [result, setResult] = useState<SdlDiffResult>()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 8,
        width: '100%',
      }}
    >
      <code>
        {result
          ? `${result.kind}: ${result.added.toLocaleString()} added, ${result.removed.toLocaleString()} removed`
          : 'comparing'}
      </code>
      <div style={{ height: 560 }}>
        <SdlDiff frame="bordered" {...props} onResult={setResult} />
      </div>
    </div>
  )
}

const subgraphAfter = subgraphSdl
  .replace('A customer account.', 'A person who can sign in.')
  .replace('email: String @deprecated(reason: "Use contact.email")\n  ', '')
  .replace('orders(first: Int = 10', 'orders(first: Int! = 20')
  .replace('  GUEST\n', '  GUEST\n  SUPPORT\n')
  .replace('  search: String\n', '  search: String\n  active: Boolean = true\n')

export const Subgraph = createPreview({
  label: 'Subgraph SDL',
  controls: {
    context: { type: 'number', default: 3 },
    loading: { type: 'boolean', default: false },
  },
  render: values => (
    <Framed
      before={subgraphSdl}
      after={subgraphAfter}
      context={values.context}
      loading={values.loading}
    />
  ),
})

// Type links go nowhere real; the hash shows in the status bar on hover.
const typeHref = (name: string) =>
  /^[A-Z]/.test(name) &&
  !['String', 'Int', 'Float', 'Boolean', 'ID'].includes(name)
    ? `#types/${name}`
    : undefined

const Interactive = ({ before, after }: { before: string; after: string }) => {
  const [selected, setSelected] = useState('none')
  return (
    <div style={{ display: 'grid', gap: 8, width: '100%' }}>
      <code>selected: {selected}</code>
      <Framed
        before={before}
        after={after}
        onSelect={({ side, coordinate }) =>
          setSelected(coordinate ? `${coordinate} (${side})` : 'none')
        }
        typeHref={typeHref}
        renderHover={(coordinate, side) => (
          <span>
            <code>{coordinate}</code>, from the {side} schema.
          </span>
        )}
      />
    </div>
  )
}

export const SelectingAndLinks = createPreview({
  label: 'Selecting and links',
  render: () => <Interactive before={subgraphSdl} after={subgraphAfter} />,
})

export const Unchanged = createPreview({
  label: 'Unchanged',
  render: () => <Framed before={subgraphSdl} after={subgraphSdl} />,
})

export const Added = createPreview({
  label: 'New schema',
  render: () => <Framed before="" after={subgraphSdl} />,
})

const moved = reorderDefinitions(subgraphAfter)

export const Moved = createPreview({
  label: 'Types moved',
  render: () => <Framed before={subgraphSdl} after={moved} />,
})

// About 4,000 types, with 3,000 edits spread over them.
const supergraph = makeSupergraph(4000)
const supergraphAfter = editFields(supergraph, 3000).sdl

export const LargeSupergraph = createPreview({
  label: 'Large supergraph',
  render: () => <Framed before={supergraph} after={supergraphAfter} />,
})

export const LargeSupergraphLinks = createPreview({
  label: 'Large supergraph, selecting and links',
  render: () => <Interactive before={supergraph} after={supergraphAfter} />,
})

export const TooLarge = createPreview({
  label: 'Too large',
  render: () => {
    const huge = '#'.repeat(40_000_001)
    return <Framed before="" after={huge} />
  },
})
