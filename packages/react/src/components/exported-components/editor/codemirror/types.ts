import type { GraphQLSchema } from 'graphql'

/**
 * Languages the Editor understands. Each maps to a CodeMirror language
 * extension in `./languages`.
 */
export type EditorLanguage = 'graphql' | 'json5' | 'typescript' | 'javascript'

/**
 * The complete, explicit input contract the React layer passes to
 * `createEditorView`. Everything CodeMirror needs to stand up an editor lives
 * here — the React binding builds this object and knows nothing about the
 * extensions behind it.
 */
export type CreateEditorOptions = {
  /** DOM node the EditorView mounts into. */
  parent: HTMLElement
  /** Initial document text. */
  doc: string
  /** Which language extension to load. */
  language: EditorLanguage
  /** Optional GraphQL schema — enables schema-aware completion/lint/hover. */
  schema?: GraphQLSchema
  /** When true, the document cannot be edited. */
  readOnly: boolean
  /** Whether to render the dark variant of the editor theme. */
  dark: boolean
  /** Called with the new document text on every user edit. */
  onChange?: (value: string) => void
}
