import { CodeEditor, type CodeEditorProps } from '../sdl-shared/code-editor'

import type { JsonSchema } from './diagnose-json'
import { useJsonEditorExtensions } from './use-json-editor-extensions'

export type JsonEditorProps = CodeEditorProps & {
  /**
   * JSON schema to check against, draft 7 unless `$schema` says otherwise. A
   * string `errorMessage` in a schema replaces the message for what it fails.
   */
  schema?: JsonSchema | boolean
}

/**
 * An editor for strict JSON, checked against a JSON schema. Problems are shown
 * under their lines and reported to the host, all as errors. Prop-driven; needs
 * no AGIProvider.
 */
export const JsonEditor = ({
  schema,
  onDiagnostics,
  label,
  ...editor
}: JsonEditorProps) => {
  const extensions = useJsonEditorExtensions({ schema, onDiagnostics, label })

  return <CodeEditor {...editor} extensions={extensions} />
}
