import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import { Editor } from '../editor/editor'

import type { SdlAnnotation, SdlTag } from './codemirror/line-state'
import type { Coordinate } from './codemirror/sdl-index'
import { FindBar } from './find-bar'
import { formatSdl } from './format-sdl'
import { useSdlExtensions } from './use-sdl-extensions'

export type SdlViewerProps = {
  /** The whole schema as SDL text. */
  sdl: string
  /**
   * Pretty-print before showing. Text that does not parse is shown as is.
   * On by default when annotations or tags are given, since they need one
   * coordinate per line.
   */
  format?: boolean
  /** Per-line annotation: a value, and an optional 0..1 ratio for the bar. */
  annotations?: ReadonlyMap<Coordinate, SdlAnnotation>
  /** Heading over the annotation column, shown in the find bar. */
  annotationLabel?: string
  /** Per-line tag shown before the annotation. */
  tags?: ReadonlyMap<Coordinate, SdlTag>
  /** Lines to render dimmed, e.g. filtered out by the host. */
  dimmed?: ReadonlySet<Coordinate>
  /** Moves the selected row to this coordinate when it changes. */
  selected?: Coordinate
  /** Called when the user selects a row, with its coordinate if it has one. */
  onSelect?: (coordinate: Coordinate | undefined) => void
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Optional visual frame around the viewer. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

/**
 * A read-only view of a schema as SDL, with colors, folding, a find bar,
 * modifier-click go-to-definition, row selection and a per-line annotation
 * column keyed by schema coordinate. Prop-driven; needs no AGIProvider.
 */
export const SdlViewer = ({
  sdl,
  format,
  annotations,
  annotationLabel,
  tags,
  dimmed,
  selected,
  onSelect,
  theme,
  frame,
  height,
}: SdlViewerProps) => {
  const pretty = format ?? (annotations !== undefined || tags !== undefined)
  const text = useMemo(() => (pretty ? formatSdl(sdl) : sdl), [pretty, sdl])
  const { extensions, findPanel } = useSdlExtensions({
    annotations,
    tags,
    dimmed,
    selected,
    onSelect,
  })

  return (
    <>
      <Editor
        value={text}
        readOnly
        theme={theme}
        extensions={extensions}
        frame={frame}
        height={height}
      />
      {findPanel &&
        createPortal(
          <FindBar
            view={findPanel.view}
            store={findPanel.store}
            label={annotationLabel}
            withColumn={annotations !== undefined || tags !== undefined}
          />,
          findPanel.dom
        )}
    </>
  )
}
