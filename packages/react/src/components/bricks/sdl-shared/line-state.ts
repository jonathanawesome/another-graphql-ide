import {
  RangeSetBuilder,
  StateEffect,
  StateField,
  type EditorState,
  type RangeSet,
} from '@codemirror/state'
import {
  BlockType,
  Decoration,
  EditorView,
  GutterMarker,
  ViewPlugin,
  gutterLineClass,
  type DecorationSet,
} from '@codemirror/view'

import type { IconNames } from '../../primitives/icon/icon'

import type { Coordinate } from './sdl-index'
import { sdlRows, type SdlSide } from './sdl-rows'

/** A per-line value, an optional 0..1 ratio for its bar, and an error note. */
export type SdlAnnotation = {
  value: string
  ratio?: number
  /** A short problem note, e.g. an error rate, shown with a red dot. */
  error?: string
}
/** A short label shown before the annotation, with an optional icon. */
export type SdlTag = { label: string; icon?: IconNames }

/** What the host says about each coordinate. */
export type LineData = {
  annotations?: ReadonlyMap<Coordinate, SdlAnnotation>
  tags?: ReadonlyMap<Coordinate, SdlTag>
  dimmed?: ReadonlySet<Coordinate>
}

/** A coordinate, and the document it is in. */
export type SdlLocation = { side: SdlSide; coordinate: Coordinate }

/** The host's data changed. */
export const setLineData = StateEffect.define<LineData>()
/** The pointer is over this line, or over none. */
export const setHoverLine = StateEffect.define<number | null>()
/** The user selected this line. The only change reported to the host. */
export const selectLine = StateEffect.define<number | null>()
/** The host selected this coordinate. */
export const syncSelected = StateEffect.define<SdlLocation | undefined>()

type RowClass = 'hover' | 'selected' | 'dimmed'
type Rows = { lines: DecorationSet; gutters: RangeSet<GutterMarker> }

class RowMarker extends GutterMarker {
  override readonly elementClass: string

  constructor(elementClass: string) {
    super()
    this.elementClass = elementClass
  }
}

const lineDecoration = {
  hover: Decoration.line({ class: 'cm-sdl-hover' }),
  selected: Decoration.line({ class: 'cm-sdl-selected' }),
  dimmed: Decoration.line({ class: 'cm-sdl-dimmed' }),
}

const gutterMarker = {
  hover: new RowMarker('cm-sdl-hover'),
  selected: new RowMarker('cm-sdl-selected'),
  dimmed: new RowMarker('cm-sdl-dimmed'),
}

// The same class on the line and on every gutter, so a row tints edge to edge.
const rowSets = (
  state: EditorState,
  rows: { line: number; cls: RowClass }[]
): Rows => {
  const decorations = new RangeSetBuilder<Decoration>()
  const markers = new RangeSetBuilder<GutterMarker>()
  for (const { line, cls } of rows) {
    if (line < 1 || line > state.doc.lines) continue
    const from = state.doc.line(line).from
    decorations.add(from, from, lineDecoration[cls])
    markers.add(from, from, gutterMarker[cls])
  }
  return { lines: decorations.finish(), gutters: markers.finish() }
}

const lineOf = (state: EditorState, location: SdlLocation | undefined) =>
  (location &&
    state.facet(sdlRows).lineOf(location.side, location.coordinate)) ??
  null

const dimmedRows = (state: EditorState, dimmed: LineData['dimmed']) => {
  const lines = new Set<number>()
  for (const coordinate of dimmed ?? []) {
    const line = lineOf(state, { side: 'after', coordinate })
    if (line !== null) lines.add(line)
  }
  const rows = [...lines]
    .sort((a, b) => a - b)
    .map(line => ({ line, cls: 'dimmed' as const }))
  return rowSets(state, rows)
}

// Hover and selection change on every pointer move, so they get their own
// small sets and never rebuild the dimmed ones.
const pointerRows = (
  state: EditorState,
  hover: number | null,
  selected: number | null
): Rows => {
  const rows: { line: number; cls: RowClass }[] = []
  if (hover !== null && hover !== selected)
    rows.push({ line: hover, cls: 'hover' })
  if (selected !== null) rows.push({ line: selected, cls: 'selected' })
  return rowSets(
    state,
    rows.sort((a, b) => a.line - b.line)
  )
}

export type LineState = {
  data: LineData
  hover: number | null
  selected: number | null
  dimmed: Rows
  pointer: Rows
}

/** The initial state, from the host's first props. */
export const initialLineState = (
  state: EditorState,
  data: LineData,
  selected?: SdlLocation
): LineState => {
  const line = lineOf(state, selected)
  return {
    data,
    hover: null,
    selected: line,
    dimmed: dimmedRows(state, data.dimmed),
    pointer: pointerRows(state, null, line),
  }
}

/**
 * Hover, selection and dimming for every row. Install it with
 * `lineStateField.init(...)` so it starts from the host's data.
 */
export const lineStateField = StateField.define<LineState>({
  create: state => initialLineState(state, {}),
  update(value, tr) {
    let { data, hover, selected } = value
    const rows = tr.state.facet(sdlRows)
    let dimmedChanged = tr.startState.facet(sdlRows) !== rows

    if (tr.docChanged) {
      // Keep the selection on the same coordinate in the new text.
      const { side, coordinate } =
        selected === null
          ? { side: 'after' as const, coordinate: undefined }
          : tr.startState.facet(sdlRows).row(selected)
      selected =
        coordinate === undefined
          ? null
          : (rows.lineOf(side, coordinate) ?? null)
      hover = null
    }

    for (const effect of tr.effects) {
      if (effect.is(setLineData)) {
        dimmedChanged ||= effect.value.dimmed !== data.dimmed
        data = effect.value
      } else if (effect.is(setHoverLine)) {
        hover = effect.value
      } else if (effect.is(selectLine)) {
        selected = effect.value
      } else if (effect.is(syncSelected)) {
        selected = lineOf(tr.state, effect.value)
      }
    }

    const pointerChanged =
      tr.docChanged || hover !== value.hover || selected !== value.selected
    if (!dimmedChanged && !pointerChanged && data === value.data) return value

    return {
      data,
      hover,
      selected,
      dimmed: dimmedChanged ? dimmedRows(tr.state, data.dimmed) : value.dimmed,
      pointer: pointerChanged
        ? pointerRows(tr.state, hover, selected)
        : value.pointer,
    }
  },
  provide: field => [
    EditorView.decorations.from(field, value => value.dimmed.lines),
    gutterLineClass.from(field, value => value.dimmed.gutters),
    EditorView.decorations.from(field, value => value.pointer.lines),
    gutterLineClass.from(field, value => value.pointer.gutters),
  ],
})

/**
 * Pointer tracking on the whole scroller, gutters included: hover follows the
 * pointer and a plain click selects the row. Modifier-click is left to
 * go-to-definition.
 */
export const linePointer = ViewPlugin.define(view => {
  const lineAt = (event: MouseEvent) => {
    const y = event.clientY - view.documentTop
    if (y < 0 || y >= view.contentHeight) return null
    const block = view.lineBlockAtHeight(y)
    // A widget in place of lines, such as a folded run, is not a row.
    if (block.type !== BlockType.Text) return null
    return view.state.doc.lineAt(block.from).number
  }

  const hover = (line: number | null) => {
    if (view.state.field(lineStateField).hover !== line) {
      view.dispatch({ effects: setHoverLine.of(line) })
    }
  }

  const onMove = (event: MouseEvent) => hover(lineAt(event))
  const onLeave = () => hover(null)
  const onDown = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return
    const line = lineAt(event)
    if (line !== null) view.dispatch({ effects: selectLine.of(line) })
  }

  const dom = view.scrollDOM
  dom.addEventListener('mousemove', onMove)
  dom.addEventListener('mouseleave', onLeave)
  dom.addEventListener('mousedown', onDown)
  return {
    destroy() {
      dom.removeEventListener('mousemove', onMove)
      dom.removeEventListener('mouseleave', onLeave)
      dom.removeEventListener('mousedown', onDown)
    },
  }
})
