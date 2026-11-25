import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '../../primitives/button/button'
import { Editor } from '../editor/editor'
import { FindBar } from '../sdl-shared/find-bar'
import { LoadingShell } from '../sdl-shared/loading-shell'
import { sdlFrameStyles as frameStyles } from '../sdl-shared/sdl-frame.css'
import type { Coordinate } from '../sdl-shared/sdl-index'

import type { SdlAnnotation, SdlTag } from './codemirror/line-state'
import type { TypeHref } from './codemirror/type-links'
import { formatSdl } from './format-sdl'
import { sdlViewerStyles as styles } from './sdl-viewer.css'
import { useSdlExtensions, type RenderHover } from './use-sdl-extensions'

export type SdlViewerProps = {
  /** The whole schema as SDL text. */
  sdl: string
  /**
   * Pretty-print before showing. Text that does not parse is shown as is.
   * On by default when annotations or tags are given, since they need one
   * coordinate per line.
   */
  format?: boolean
  /** Placeholder lines, and "Loading schema…" in the footer. */
  loading?: boolean
  /** Shown instead of the code when `sdl` is blank. */
  empty?: ReactNode
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
  /**
   * Scrolls a definition to the top, once per `nonce`, e.g. arriving from a
   * reference page.
   */
  reveal?: { coordinate: Coordinate; nonce: number }
  /**
   * Type names become links to the host's page for each type. A plain click
   * still selects the row; Shift-Cmd/Ctrl-click, middle-click and the
   * context menu open the link.
   */
  typeHref?: TypeHref
  /**
   * Content for a card under a line after a short hover, keyed by the line's
   * coordinate. Return nothing for no card. Called on each hover to decide,
   * so keep it cheap.
   */
  renderHover?: RenderHover
  /**
   * Hides the annotation column, leaving a toggle in the find bar. Leave
   * unset for the viewer to keep this itself.
   */
  columnCollapsed?: boolean
  /** Called when the find bar's toggle is pressed. */
  onColumnCollapsedChange?: (collapsed: boolean) => void
  /**
   * Footer text, with a Copy SDL button beside it. Omit to hide the footer
   * (it still shows while loading).
   */
  status?: string
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Optional visual frame around the viewer. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

const COPIED_FOR = 1500

const CopyButton = ({
  text,
  disabled,
}: {
  text: string
  disabled: boolean
}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_FOR)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // No clipboard outside secure contexts, or permission was refused.
    }
  }

  return (
    <Button
      text={copied ? 'Copied' : 'Copy SDL'}
      label="Copy SDL"
      ghost
      state={disabled ? 'disabled' : undefined}
      action={() => void copy()}
    />
  )
}

/**
 * A read-only view of a schema as SDL, with colors, folding, a find bar,
 * modifier-click go-to-definition, row selection, type links, hover cards and a per-line
 * annotation column keyed by schema coordinate. Prop-driven; needs no
 * AGIProvider.
 */
export const SdlViewer = ({
  sdl,
  format,
  loading = false,
  empty = 'No composed schema yet',
  annotations,
  annotationLabel,
  tags,
  dimmed,
  selected,
  onSelect,
  reveal,
  typeHref,
  renderHover,
  columnCollapsed,
  onColumnCollapsedChange,
  status,
  theme,
  frame,
  height,
}: SdlViewerProps) => {
  const withColumn = annotations !== undefined || tags !== undefined
  const pretty = format ?? withColumn
  const text = useMemo(() => (pretty ? formatSdl(sdl) : sdl), [pretty, sdl])
  const isEmpty = !loading && sdl.trim() === ''
  const [ownCollapsed, setOwnCollapsed] = useState(false)
  const collapsed = columnCollapsed ?? ownCollapsed
  const toggleColumn = () => {
    setOwnCollapsed(!collapsed)
    onColumnCollapsedChange?.(!collapsed)
  }
  const { extensions, findPanel, card } = useSdlExtensions({
    annotations,
    tags,
    dimmed,
    selected,
    onSelect,
    reveal,
    typeHref,
    renderHover,
    columnCollapsed: collapsed,
  })

  return (
    <div
      className={frameStyles.root({ frame })}
      style={height !== undefined ? { height } : undefined}
      aria-busy={loading || undefined}
    >
      <div className={frameStyles.body}>
        {/* Stays mounted under the overlays, so its state never goes stale. */}
        <div inert={loading || isEmpty} className={frameStyles.editor}>
          <Editor value={text} readOnly theme={theme} extensions={extensions} />
        </div>
        {loading && (
          <div className={frameStyles.overlay}>
            <LoadingShell
              label={collapsed ? undefined : annotationLabel}
              withColumn={
                (withColumn || annotationLabel !== undefined) && !collapsed
              }
            />
          </div>
        )}
        {isEmpty && (
          <div className={frameStyles.overlay}>
            <div className={frameStyles.empty}>{empty}</div>
          </div>
        )}
      </div>
      {(status !== undefined || loading) && (
        <div className={styles.footer}>
          <span className={styles.status} aria-live="polite">
            {loading ? 'Loading schema…' : status}
          </span>
          <CopyButton text={text} disabled={loading || isEmpty} />
        </div>
      )}
      {findPanel &&
        createPortal(
          <FindBar
            view={findPanel.view}
            store={findPanel.store}
            label={annotationLabel}
            withColumn={withColumn}
            collapsed={collapsed}
            onToggleColumn={toggleColumn}
          />,
          findPanel.dom
        )}
      {card &&
        renderHover &&
        createPortal(renderHover(card.coordinate), card.dom, card.coordinate)}
    </div>
  )
}
