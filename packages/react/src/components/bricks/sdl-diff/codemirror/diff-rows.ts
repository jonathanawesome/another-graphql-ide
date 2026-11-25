import { RangeSetBuilder, type Extension } from '@codemirror/state'
import {
  Decoration,
  GutterMarker,
  ViewPlugin,
  gutter,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from '@codemirror/view'

import { ADDED, REMOVED, type Rows } from '../compare/compare-sdl'

import { foldMarker } from './diff-folds'

const ROW_CLASS = { [REMOVED]: 'cm-sdl-removed', [ADDED]: 'cm-sdl-added' }
const SIGN = { [REMOVED]: '−', [ADDED]: '+' }

const rowClass = (kind: number) =>
  kind === REMOVED || kind === ADDED ? ROW_CLASS[kind] : undefined

const lineDecoration = {
  [REMOVED]: Decoration.line({ class: ROW_CLASS[REMOVED] }),
  [ADDED]: Decoration.line({ class: ROW_CLASS[ADDED] }),
}

/** A row's line number and its + or −, so meaning doesn't rest on color. */
class RowMarker extends GutterMarker {
  readonly number: string
  readonly kind: number
  override readonly elementClass: string

  constructor(number: string, kind: number) {
    super()
    this.number = number
    this.kind = kind
    this.elementClass = rowClass(kind) ?? ''
  }

  override eq(other: RowMarker) {
    return other.number === this.number && other.kind === this.kind
  }

  override toDOM() {
    const row = document.createElement('span')
    row.className = 'cm-sdl-diff-number'
    row.textContent = this.number
    const sign = document.createElement('span')
    sign.className = 'cm-sdl-diff-sign'
    if (this.kind === REMOVED || this.kind === ADDED) {
      sign.textContent = SIGN[this.kind]
    }
    const cell = document.createElement('span')
    cell.className = 'cm-sdl-diff-cell'
    cell.append(row, sign)
    return cell
  }
}

const rowAt = (view: EditorView, offset: number) =>
  view.state.doc.lineAt(offset).number - 1

/** The old line's number on a removed row, the new line's on any other. */
const rowMarker = (rows: Rows, row: number) => {
  const kind = rows.kinds[row] ?? 0
  const number = (kind === REMOVED ? rows.before : rows.after)[row] ?? 0
  return new RowMarker(number > 0 ? String(number) : '', kind)
}

const rowTints = (rows: Rows) => {
  const build = (view: EditorView): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>()
    for (const { from, to } of view.visibleRanges) {
      for (let offset = from; offset <= to;) {
        const line = view.state.doc.lineAt(offset)
        const kind = rows.kinds[line.number - 1]
        if (kind === REMOVED || kind === ADDED) {
          builder.add(line.from, line.from, lineDecoration[kind])
        }
        offset = line.to + 1
      }
    }
    return builder.finish()
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = build(view)
      }

      update(update: ViewUpdate) {
        if (update.viewportChanged) this.decorations = build(update.view)
      }
    },
    { decorations: plugin => plugin.decorations }
  )
}

/** Row tints, and the gutter of line numbers and signs. */
export const diffRows = (rows: Rows, lines: number): Extension => {
  const widest = new RowMarker(String(lines), ADDED)
  return [
    rowTints(rows),
    gutter({
      class: 'cm-sdl-diff-gutter',
      lineMarker: (view, line) => rowMarker(rows, rowAt(view, line.from)),
      widgetMarker: () => foldMarker,
      initialSpacer: () => widest,
    }),
  ]
}
