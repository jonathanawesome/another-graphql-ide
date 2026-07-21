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
  } = options

  const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
      onChange?.(update.state.doc.toString())
    }
    // Emit only when the active operation name actually changes, so cursor
    // moves within the same operation write nothing downstream.
    if (update.docChanged || update.selectionSet) {
      const next = update.state.field(activeOperationField).name
      const prev = update.startState.field(activeOperationField).name
      if (next !== prev) onActiveOperationChange?.(next)
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

  // Emit the initial name so a document present on mount labels the button
  // before any interaction. The updateListener only fires on later changes.
  onActiveOperationChange?.(view.state.field(activeOperationField).name)

  return view
}
