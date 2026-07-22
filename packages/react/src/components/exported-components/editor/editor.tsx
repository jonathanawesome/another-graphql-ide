import type { GraphQLSchema } from 'graphql'

import type { EditorLanguage } from './codemirror/types'
import { editorStyles } from './editor.css'
import { useCodemirror } from './hooks/use-codemirror'

export type EditorProps = {
  /** Language the editor should parse and highlight. */
  language: EditorLanguage
  /** Controlled document value. Provide together with `onChange`. */
  value?: string
  /** Initial document value for uncontrolled usage. */
  defaultValue?: string
  /** Called with the new document text on every edit. */
  onChange?: (value: string) => void
  /**
   * Called with the active operation name (or undefined) on cursor / doc
   * change. Only meaningful when `language` is `graphql`.
   */
  onActiveOperationChange?: (name: string | undefined) => void
  /** Called with the caret offset on cursor / doc change. */
  onSelectionChange?: (offset: number) => void
  /**
   * A one-shot request to move the caret or select a range, applied once per
   * `nonce`. Lets state-driven edits place the cursor or select a placeholder
   * to type over (e.g. after a schema tree insert).
   */
  pendingSelection?: { anchor: number; head: number; nonce: number }
  /**
   * GraphQL schema powering schema-aware completion, linting, and hover.
   * Only used when `language` is `graphql`.
   */
  schema?: GraphQLSchema
  /** Render the document read-only. */
  readOnly?: boolean
  /** Optional visual frame around the editor. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

export const Editor = ({
  language,
  value,
  defaultValue,
  onChange,
  onActiveOperationChange,
  onSelectionChange,
  pendingSelection,
  schema,
  readOnly,
  frame,
  height,
}: EditorProps) => {
  const containerRef = useCodemirror({
    value,
    defaultValue,
    language,
    schema,
    readOnly,
    onChange,
    onActiveOperationChange,
    onSelectionChange,
    pendingSelection,
  })

  return (
    <div
      ref={containerRef}
      className={editorStyles.container({ frame })}
      style={height !== undefined ? { height } : undefined}
    />
  )
}
