import { themeContract } from '@another-graphql-ide/style'
import { json } from '@codemirror/lang-json'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Prec, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { useEffect, useState } from 'react'

import { codeEditorTheme } from '../sdl-shared/code-editor-theme'
import { diagnostics, recheck, type Report } from '../sdl-shared/diagnostics'

import { createJsonCheck, type JsonSchema } from './diagnose-json'

export type UseJsonEditorExtensionsParams = {
  schema?: JsonSchema | boolean
  label?: string
  onDiagnostics?: Report
}

// Other languages here color property names as text.
const keyColor = Prec.high(
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.propertyName, color: themeContract.syntax.function },
    ])
  )
)

/** Latest props and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  check = createJsonCheck()
  schemaText: string | undefined
  label?: string
  onDiagnostics?: Report

  update({ label, onDiagnostics }: UseJsonEditorExtensionsParams) {
    this.label = label
    this.onDiagnostics = onDiagnostics
  }

  /** Returns whether the schema is a different one, by content. */
  setSchema(schema: JsonSchema | boolean | undefined) {
    const text = JSON.stringify(schema)
    if (text === this.schemaText) return false
    this.schemaText = text
    this.check = createJsonCheck(schema)
    return true
  }
}

const createHandlers = (params: UseJsonEditorExtensionsParams) => {
  const handlers = new Handlers()
  handlers.update(params)
  handlers.setSchema(params.schema)

  const extensions: Extension = [
    json(),
    keyColor,
    codeEditorTheme,
    diagnostics(
      text => handlers.check(text),
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
        },
      }
    }),
  ]

  return { handlers, extensions }
}

/** Extensions that make Editor a JSON editor. Stable across renders. */
export const useJsonEditorExtensions = (
  params: UseJsonEditorExtensionsParams
): Extension => {
  const [{ handlers, extensions }] = useState(() => createHandlers(params))
  const { schema } = params

  useEffect(() => {
    handlers.update(params)
  })

  // By content, so a schema written inline does not recheck on every render.
  useEffect(() => {
    if (!handlers.setSchema(schema)) return
    handlers.view?.dispatch({ effects: recheck.of(null) })
  }, [handlers, schema])

  return extensions
}
