import {
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  GutterMarker,
  WidgetType,
  type DecorationSet,
} from '@codemirror/view'

import type { Folds } from '../compare/run-comparison'

/** Height of the row that stands for a folded run. */
export const FOLD_ROW_HEIGHT = 30

/** Open the folded run at this offset. */
const openRun = StateEffect.define<number>()

class FoldedRun extends WidgetType {
  readonly lines: number

  constructor(lines: number) {
    super()
    this.lines = lines
  }

  override eq(other: FoldedRun) {
    return other.lines === this.lines
  }

  override get estimatedHeight() {
    return FOLD_ROW_HEIGHT
  }

  override toDOM(view: EditorView) {
    const row = document.createElement('div')
    row.className = 'cm-sdl-folded'
    const button = row.appendChild(document.createElement('button'))
    button.type = 'button'
    button.textContent = `${this.lines.toLocaleString()} unchanged lines`
    button.title = 'Show these lines'
    button.onclick = () => {
      view.dispatch({ effects: openRun.of(view.posAtDOM(row)) })
    }
    return row
  }
}

class FoldMarker extends GutterMarker {
  override readonly elementClass = 'cm-sdl-folded-gutter'
}

/** Carries a folded run's row across the gutter. */
export const foldMarker = new FoldMarker()

const buildFolds = ({ from, to, lines }: Folds) => {
  const builder = new RangeSetBuilder<Decoration>()
  from.forEach((start, i) => {
    const widget = new FoldedRun(lines[i] ?? 0)
    builder.add(
      start,
      to[i] ?? start,
      Decoration.replace({ widget, block: true })
    )
  })
  return builder.finish()
}

const open = (folds: DecorationSet, from: number, to: number) =>
  folds.update({
    filterFrom: from,
    filterTo: to,
    filter: (start, end) => end < from || start > to,
  })

/** Folded runs of unchanged rows. A match found inside one opens it. */
export const diffFolds = (folds: Folds): Extension =>
  StateField.define<DecorationSet>({
    create: () => buildFolds(folds),
    update(value, tr) {
      for (const effect of tr.effects) {
        if (effect.is(openRun)) value = open(value, effect.value, effect.value)
      }
      if (tr.isUserEvent('select.search')) {
        const { from, to } = tr.state.selection.main
        value = open(value, from, to)
      }
      return value
    },
    provide: field => EditorView.decorations.from(field),
  })
