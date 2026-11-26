import { foldService } from '@codemirror/language'
import {
  StateEffect,
  StateField,
  type ChangeDesc,
  type Extension,
  type Text,
} from '@codemirror/state'
import {
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'

import { checkDelay } from '../../sdl-shared/check-delay'
import { indexSdl, type SdlIndex } from '../../sdl-shared/sdl-index'
import { sdlMarks } from '../../sdl-shared/sdl-marks'

type EditState = {
  index: SdlIndex
  /** The text `index` describes. */
  indexed: Text
  /** Edits since then. Null when the index is current. */
  since: ChangeDesc | null
  marks: DecorationSet
  /** How long the index took, in milliseconds. */
  cost: number
}

/** Indexing slower than this waits for a pause in typing. */
export const MAX_INDEX_MS = 8

const reindex = StateEffect.define()

const build = (doc: Text): EditState => {
  const start = performance.now()
  const index = indexSdl(doc.toString())
  const marks = sdlMarks(index.tokens)
  return {
    index,
    indexed: doc,
    since: null,
    marks,
    cost: performance.now() - start,
  }
}

/** Colors and folds, rebuilt on each edit where that is quick. */
export const editField = StateField.define<EditState>({
  create: state => build(state.doc),
  update(value, tr) {
    if (tr.effects.some(effect => effect.is(reindex)))
      return build(tr.state.doc)
    if (!tr.docChanged) return value
    if (value.cost < MAX_INDEX_MS) return build(tr.state.doc)
    return {
      ...value,
      since: value.since
        ? value.since.composeDesc(tr.changes)
        : tr.changes.desc,
      marks: value.marks.map(tr.changes),
    }
  },
  provide: field => EditorView.decorations.from(field, value => value.marks),
})

const reindexOnPause = ViewPlugin.fromClass(
  class {
    private timer: ReturnType<typeof setTimeout> | undefined

    update({ docChanged, state, view }: ViewUpdate) {
      if (!docChanged) return
      clearTimeout(this.timer)
      const { since, cost } = state.field(editField)
      if (!since) return
      this.timer = setTimeout(
        () => view.dispatch({ effects: reindex.of(null) }),
        checkDelay(cost)
      )
    }

    destroy() {
      clearTimeout(this.timer)
    }
  }
)

const folds = foldService.of((state, lineStart) => {
  const { index, indexed, since } = state.field(editField)
  if (!since) {
    return index.folds.get(state.doc.lineAt(lineStart).number) ?? null
  }
  // Look the line up in the indexed text, and move its fold to this one.
  const before = since.invertedDesc.mapPos(lineStart)
  const fold = index.folds.get(indexed.lineAt(before).number)
  if (!fold) return null
  const from = since.mapPos(fold.from, 1)
  const to = since.mapPos(fold.to, -1)
  const line = state.doc.lineAt(lineStart)
  return from >= line.from && from <= line.to && to > line.to
    ? { from, to }
    : null
})

export const sdlEditing: Extension = [editField, reindexOnPause, folds]
