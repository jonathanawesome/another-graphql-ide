import { indentWithTab } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from 'codemirror'

import { activeOperationField } from './active-operation-field'
import { initialLanguage, initialReadOnly, initialTheme } from './compartments'
import { editorHighlight } from './highlight'
import type { CreateEditorOptions } from './types'

/**
 * The single "assemble CodeMirror" entry point. Builds an EditorState from the
 * basic setup, the shared highlight style, the three reconfigurable
 * compartments, and a change listener, then mounts and returns an EditorView.
 * The React layer calls this and otherwise stays out of CodeMirror internals.
 */
export const createEditorView = (options: CreateEditorOptions): EditorView => {
  const {
    parent,
    doc,
    language,
    schema,
    readOnly,
    dark,
    onChange,
    onActiveOperationChange,
    onSelectionChange,
  } = options

  const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
      onChange?.(update.state.doc.toString())
    }
    if (update.docChanged || update.selectionSet) {
      // Emit the active operation name only when it actually changes, so cursor
      // moves within the same operation write nothing downstream.
      const next = update.state.field(activeOperationField).name
      const prev = update.startState.field(activeOperationField).name
      if (next !== prev) onActiveOperationChange?.(next)

      // Emit the caret offset on any move so state-driven edits (e.g. schema
      // tree inserts) know where the cursor is.
      const nextHead = update.state.selection.main.head
      const prevHead = update.startState.selection.main.head
      if (nextHead !== prevHead) onSelectionChange?.(nextHead)
    }
  })

  const state = EditorState.create({
    doc,
    extensions: [
      basicSetup,
      // Tab indents / Shift-Tab dedents inside the editor. CM6 leaves Tab for
      // focus movement by default; Escape then Tab still exits for keyboard nav.
      keymap.of([indentWithTab]),
      initialLanguage(language, schema),
      initialTheme(dark),
      initialReadOnly(readOnly),
      editorHighlight,
      activeOperationField,
      updateListener,
    ],
  })

  const view = new EditorView({ state, parent })

  // Emit the initial name and caret so a document present on mount is reflected
  // before any interaction. The updateListener only fires on later changes.
  onActiveOperationChange?.(view.state.field(activeOperationField).name)
  onSelectionChange?.(view.state.selection.main.head)

  return view
}
