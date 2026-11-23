import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'

import {
  initialExtensions,
  initialLanguage,
  initialReadOnly,
  initialTheme,
} from './compartments'
import { editorHighlight } from './highlight'
import type { CreateEditorOptions } from './types'

/**
 * The single "assemble CodeMirror" entry point: the basic setup, the shared
 * highlight style, the reconfigurable compartments and a change listener.
 * Anything more specific (operations, SDL) arrives through `extensions`.
 */
export const createEditorView = ({
  parent,
  doc,
  language,
  schema,
  readOnly,
  dark,
  extensions,
  onChange,
}: CreateEditorOptions): EditorView => {
  const state = EditorState.create({
    doc,
    extensions: [
      basicSetup,
      initialLanguage(language, schema),
      initialTheme(dark),
      initialReadOnly(readOnly),
      editorHighlight,
      initialExtensions(extensions),
      EditorView.updateListener.of(update => {
        if (update.docChanged) onChange?.(update.state.doc.toString())
      }),
    ],
  })

  return new EditorView({ state, parent })
}
