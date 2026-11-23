import type { Extension } from '@codemirror/state'
import type { GraphQLSchema } from 'graphql'

import type { EditorLanguage } from './codemirror/types'
import { editorStyles } from './editor.css'
import { useCodemirror } from './hooks/use-codemirror'

export type EditorProps = {
  /** Language to parse and highlight; omit for plain text. */
  language?: EditorLanguage
  /** Controlled document value. Provide together with `onChange`. */
  value?: string
  /** Initial document value for uncontrolled usage. */
  defaultValue?: string
  /** Called with the new document text on every edit. */
  onChange?: (value: string) => void
  /**
   * GraphQL schema powering schema-aware completion, linting, and hover.
   * Only used when `language` is `graphql`.
   */
  schema?: GraphQLSchema
  /** Render the document read-only. */
  readOnly?: boolean
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /**
   * Extra CodeMirror extensions, e.g. from useOperationExtensions. Keep the
   * value stable: a new one reconfigures the editor.
   */
  extensions?: Extension
  /** Optional visual frame around the editor. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

/**
 * A basic editor: text, language, read-only and theme. Anything more arrives as
 * extensions. Works with or without AGIProvider.
 */
export const Editor = ({
  language,
  value,
  defaultValue,
  onChange,
  schema,
  readOnly,
  theme,
  extensions,
  frame,
  height,
}: EditorProps) => {
  const containerRef = useCodemirror({
    value,
    defaultValue,
    language,
    schema,
    readOnly,
    theme,
    extensions,
    onChange,
  })

  return (
    <div
      ref={containerRef}
      className={editorStyles.container({ frame })}
      style={height !== undefined ? { height } : undefined}
    />
  )
}
