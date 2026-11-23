import { indentWithTab } from '@codemirror/commands'
import type { Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, keymap } from '@codemirror/view'

import { activeOperationField } from './active-operation-field'

export type OperationExtensionOptions = {
  /** Called with the active operation name when it changes, and on mount. */
  onActiveOperationChange?: (name: string | undefined) => void
  /** Called with the caret offset when it moves, and on mount. */
  onSelectionChange?: (offset: number) => void
  /** Receives the view on mount and null on destroy. */
  onView?: (view: EditorView | null) => void
}

/**
 * What an operation editor adds on top of the basic Editor: Tab indent, the
 * active operation (with dimming of the others) and the caret offset.
 */
export const operationExtensions = ({
  onActiveOperationChange,
  onSelectionChange,
  onView,
}: OperationExtensionOptions): Extension => [
  // CM6 leaves Tab for focus movement; Escape then Tab still exits.
  keymap.of([indentWithTab]),
  activeOperationField,
  EditorView.updateListener.of(update => {
    if (!update.docChanged && !update.selectionSet) return

    // Only on a real change, so caret moves inside one operation write nothing.
    const next = update.state.field(activeOperationField).name
    if (next !== update.startState.field(activeOperationField).name) {
      onActiveOperationChange?.(next)
    }

    const head = update.state.selection.main.head
    if (head !== update.startState.selection.main.head) {
      onSelectionChange?.(head)
    }
  }),
  // The listener only sees later updates, so report the starting state here.
  ViewPlugin.define(view => {
    onView?.(view)
    onActiveOperationChange?.(view.state.field(activeOperationField).name)
    onSelectionChange?.(view.state.selection.main.head)
    return { destroy: () => onView?.(null) }
  }),
]
