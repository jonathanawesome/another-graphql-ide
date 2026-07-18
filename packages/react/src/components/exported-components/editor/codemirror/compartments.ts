import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { GraphQLSchema } from 'graphql'

import { languageExtension } from './languages'
import { editorTheme } from './theme'
import type { EditorLanguage } from './types'

/**
 * Compartments let us reconfigure parts of the editor (language, theme,
 * read-only) on a live EditorView without rebuilding it. Each has a paired
 * `initial*` builder (used by the setup factory) and `reconfigure*` helper
 * (used by the React binding), so every reconfigure transaction is defined in
 * exactly one place.
 */
export const languageCompartment = new Compartment()
export const themeCompartment = new Compartment()
export const readOnlyCompartment = new Compartment()

/** Combined read-only + non-editable extension for a given flag. */
const readOnlyExtension = (readOnly: boolean) => [
  EditorState.readOnly.of(readOnly),
  EditorView.editable.of(!readOnly),
]

export const initialLanguage = (
  language: EditorLanguage,
  schema?: GraphQLSchema
) => languageCompartment.of(languageExtension(language, schema))

export const initialTheme = (dark: boolean) =>
  themeCompartment.of(editorTheme(dark))

export const initialReadOnly = (readOnly: boolean) =>
  readOnlyCompartment.of(readOnlyExtension(readOnly))

export const reconfigureLanguage = (
  view: EditorView,
  language: EditorLanguage,
  schema?: GraphQLSchema
) => {
  view.dispatch({
    effects: languageCompartment.reconfigure(
      languageExtension(language, schema)
    ),
  })
}

export const reconfigureTheme = (view: EditorView, dark: boolean) => {
  view.dispatch({ effects: themeCompartment.reconfigure(editorTheme(dark)) })
}

export const reconfigureReadOnly = (view: EditorView, readOnly: boolean) => {
  view.dispatch({
    effects: readOnlyCompartment.reconfigure(readOnlyExtension(readOnly)),
  })
}
