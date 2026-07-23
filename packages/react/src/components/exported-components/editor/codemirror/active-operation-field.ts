import { StateField } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'

import {
  getOperationRanges,
  selectActiveOperationIndex,
  type OperationRange,
} from './active-operation'

/**
 * Active operation name and dimming decorations, plus the parsed operation
 * ranges they derive from. The ranges are cached on the field value so a
 * selection-only change can re-pick the active operation without re-parsing.
 */
export type ActiveOperationState = {
  name?: string
  decorations: DecorationSet
  ranges: OperationRange[]
}

// Wrapping mark whose opacity dims every syntax-highlight span it contains.
const dimMark = Decoration.mark({ class: 'cm-agi-dimmed' })

// Build the name + decorations for a cursor position from already-parsed ranges.
// Cheap: no document parse, just an index pick and mark construction.
const buildState = (
  ranges: OperationRange[],
  cursor: number
): ActiveOperationState => {
  const active = selectActiveOperationIndex(ranges, cursor)
  const marks = ranges
    .filter((_, i) => i !== active)
    .map(r => dimMark.range(r.from, r.to))
  return {
    name: active === -1 ? undefined : ranges[active]?.name,
    decorations: Decoration.set(marks, true),
    ranges,
  }
}

/**
 * Single source of truth for the active operation. Provides the dimming
 * decorations and exposes the active name (read by the update listener in
 * setup.ts). A StateField may depend on the selection, so cursor-driven dimming
 * is valid here where a ViewPlugin is not.
 *
 * Operation ranges only change when the document changes, so a caret move reuses
 * the cached ranges and only re-picks the active operation. This keeps the
 * getOperationFacts parse off the per-caret-move path, which matters on large
 * documents where that parse is the dominant per-interaction cost.
 */
export const activeOperationField = StateField.define<ActiveOperationState>({
  create: state =>
    buildState(
      getOperationRanges(state.doc.toString()),
      state.selection.main.head
    ),
  update: (value, tr) => {
    if (!tr.docChanged && !tr.selection) return value
    const ranges = tr.docChanged
      ? getOperationRanges(tr.state.doc.toString())
      : value.ranges
    return buildState(ranges, tr.state.selection.main.head)
  },
  provide: field => EditorView.decorations.from(field, v => v.decorations),
})
