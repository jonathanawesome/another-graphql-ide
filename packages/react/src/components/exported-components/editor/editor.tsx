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
  /**
   * GraphQL schema powering schema-aware completion, linting, and hover.
   * Only used when `language` is `graphql`.
   */
  schema?: GraphQLSchema
  /** Render the document read-only. */
  readOnly?: boolean
  /** Optional class applied to the editor container. */
  className?: string
}

export const Editor = ({
  language,
  value,
  defaultValue,
  onChange,
  onActiveOperationChange,
  schema,
  readOnly,
  className,
}: EditorProps) => {
  const containerRef = useCodemirror({
    value,
    defaultValue,
    language,
    schema,
    readOnly,
    onChange,
    onActiveOperationChange,
  })

  return (
    <div
      ref={containerRef}
      className={
        className
          ? `${editorStyles.container} ${className}`
          : editorStyles.container
      }
    />
  )
}
