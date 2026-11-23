import type { CSSProperties } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { DocsEditor } from '../recipes'
import { AGIProvider } from '../state'
import { darkTheme, themeVars, tokens } from '../style'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/Host Theming'

/** The accent has no single token: a fill, its ink, a line and the focus ring. */
const accent = (color: string, ink: string) =>
  themeVars({
    fill: { primary: color },
    on: { primary: ink },
    accent: { line: color },
    focus: { ring: color },
  })

const accentOnly = accent('oklch(60% 0.18 250)', 'white')

/**
 * The darkTheme class scopes the whole dark theme to the wrapper, and themeVars
 * still layers an accent override on top. tokens keeps the host's own
 * background and text on the same scale.
 */
const scopedDark = {
  className: darkTheme,
  style: {
    ...accent('oklch(72% 0.17 150)', 'black'),
    background: tokens.bg.canvas,
    color: tokens.text.primary,
    padding: 12,
    borderRadius: 8,
  },
}

const Instance = ({
  name,
  className,
  style,
  caption,
}: {
  name: 'graphiql' | 'veterinary'
  className?: string
  style: CSSProperties
  caption: string
}) => {
  const { schema, path } = SCHEMAS[name]

  return (
    <div className={className} style={{ flex: 1, minWidth: 0, ...style }}>
      <p style={{ fontSize: 12, marginBottom: 8 }}>{caption}</p>
      <AGIProvider schema={schema} endpoint={endpointFor(path)} theme={false}>
        <DocsEditor height={360} />
      </AGIProvider>
    </div>
  )
}

export const ScopedTokens = createPreview({
  label: 'Two instances, themed by their wrappers',
  render: () => (
    <div style={{ display: 'flex', gap: 16, width: '100%' }}>
      <Instance
        name="graphiql"
        style={accentOnly}
        caption="Accent only. Neutrals follow the page theme."
      />
      <Instance
        name="veterinary"
        {...scopedDark}
        caption="A dark scope on whatever the page is using."
      />
    </div>
  ),
})
