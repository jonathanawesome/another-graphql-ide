import { useMemo } from 'react'

import { Editor } from '../editor/editor'

import { sdlExtensions } from './codemirror/sdl-extensions'
import { formatSdl } from './format-sdl'

export type SdlViewerProps = {
  /** The whole schema as SDL text. */
  sdl: string
  /** Pretty-print before showing. Text that does not parse is shown as is. */
  format?: boolean
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Optional visual frame around the viewer. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

/**
 * A read-only view of a schema as SDL, with colours, folding, search and
 * modifier-click go-to-definition. Prop-driven; needs no AGIProvider.
 */
export const SdlViewer = ({
  sdl,
  format = false,
  theme,
  frame,
  height,
}: SdlViewerProps) => {
  const text = useMemo(() => (format ? formatSdl(sdl) : sdl), [format, sdl])

  return (
    <Editor
      value={text}
      readOnly
      theme={theme}
      extensions={sdlExtensions}
      frame={frame}
      height={height}
    />
  )
}
