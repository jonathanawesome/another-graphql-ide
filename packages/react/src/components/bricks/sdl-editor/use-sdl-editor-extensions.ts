import { autocompletion } from '@codemirror/autocomplete'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useState } from 'react'

import { codeEditorTheme } from '../sdl-shared/code-editor-theme'
import { diagnostics, recheck, type Report } from '../sdl-shared/diagnostics'
import { sdlColors } from '../sdl-shared/sdl-theme'

import { SdlChecker } from './check/sdl-checker'
import { completeSdl } from './codemirror/complete'
import { sdlEditing } from './codemirror/edit-field'

export type UseSdlEditorExtensionsParams = {
  contextSdl?: string
  contextLabel?: string
  label?: string
  onDiagnostics?: Report
}

/** Latest props and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  contextLabel?: string
  label?: string
  onDiagnostics?: Report

  update(params: UseSdlEditorExtensionsParams) {
    this.contextLabel = params.contextLabel
    this.label = params.label
    this.onDiagnostics = params.onDiagnostics
  }
}

const sdlLanguage = [
  EditorState.languageData.of(() => [{ commentTokens: { line: '#' } }]),
]

const createHandlers = (params: UseSdlEditorExtensionsParams) => {
  const handlers = new Handlers()
  handlers.update(params)
  const checker = new SdlChecker(params.contextSdl)

  const extensions: Extension = [
    sdlLanguage,
    sdlEditing,
    sdlColors,
    codeEditorTheme,
    autocompletion({
      icons: false,
      override: [
        completeSdl(() => ({
          names: checker.names(),
          label: handlers.contextLabel,
        })),
      ],
    }),
    diagnostics(
      text => checker.check(text),
      (found, text) => handlers.onDiagnostics?.(found, text)
    ),
    EditorView.contentAttributes.of((): Record<string, string> =>
      handlers.label === undefined ? {} : { 'aria-label': handlers.label }
    ),
    ViewPlugin.define(view => {
      handlers.view = view
      return {
        destroy: () => {
          handlers.view = null
          checker.stop()
        },
      }
    }),
  ]

  return { handlers, checker, extensions }
}

/** Extensions that make Editor an SDL editor. Stable across renders. */
export const useSdlEditorExtensions = (
  params: UseSdlEditorExtensionsParams
): Extension => {
  const [{ handlers, checker, extensions }] = useState(() =>
    createHandlers(params)
  )
  const { contextSdl } = params

  useEffect(() => {
    handlers.update(params)
  })

  useEffect(() => {
    if (!checker.setContext(contextSdl)) return
    handlers.view?.dispatch({ effects: recheck.of(null) })
  }, [handlers, checker, contextSdl])

  return extensions
}
