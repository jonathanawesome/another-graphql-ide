import { indentWithTab } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from 'codemirror'

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
  const { parent, doc, language, schema, readOnly, dark, onChange } = options

  const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
      onChange?.(update.state.doc.toString())
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
      updateListener,
    ],
  })

  return new EditorView({ state, parent })
}
