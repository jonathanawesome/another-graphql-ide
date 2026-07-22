import { StateField } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'

import {
  getOperationRanges,
  selectActiveOperationIndex,
} from './active-operation'

/** Active operation name plus the decorations dimming the inactive ones. */
export type ActiveOperationState = { name?: string; decorations: DecorationSet }

// Wrapping mark whose opacity dims every syntax-highlight span it contains.
const dimMark = Decoration.mark({ class: 'cm-agi-dimmed' })

const compute = (query: string, cursor: number): ActiveOperationState => {
  const ranges = getOperationRanges(query)
  const active = selectActiveOperationIndex(ranges, cursor)
  const marks = ranges
    .filter((_, i) => i !== active)
    .map(r => dimMark.range(r.from, r.to))
  return {
    name: active === -1 ? undefined : ranges[active]?.name,
    decorations: Decoration.set(marks, true),
  }
}

/**
 * Single source of truth for the active operation. Recomputes on doc or cursor
 * change and both provides the dimming decorations and exposes the active name
 * (read by the update listener in setup.ts). A StateField may depend on the
 * selection, so cursor-driven dimming is valid here where a ViewPlugin is not.
 */
export const activeOperationField = StateField.define<ActiveOperationState>({
  create: state => compute(state.doc.toString(), state.selection.main.head),
  update: (value, tr) => {
    if (!tr.docChanged && !tr.selection) return value
    return compute(tr.state.doc.toString(), tr.state.selection.main.head)
  },
  provide: field => EditorView.decorations.from(field, v => v.decorations),
})
