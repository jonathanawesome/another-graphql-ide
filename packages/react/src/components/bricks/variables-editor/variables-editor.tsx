import { parseVariables } from '@another-graphql-ide/state'

import { useAppStore } from '../../../state'
import { Editor } from '../editor/editor'

import { variablesEditorStyles } from './variables-editor.css'

export type VariablesEditorProps = {
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
  frame?: 'none' | 'bordered'
  /** Heading text. Omit to render the editor alone. */
  label?: string
}

/**
 * The operation's variables, as an optional brick. Deliberately not part of
 * DocumentPane: an embed that has no use for variables should not pay for one.
 */
export const VariablesEditor = ({
  height = 160,
  frame = 'bordered',
  label,
}: VariablesEditorProps) => {
  const variables = useAppStore.use.variables()
  const setVariables = useAppStore.use.setVariables()

  // Reported here rather than only at execution, since the editor highlights
  // json5 and the mistake is easier to fix while looking at it.
  const parsed = parseVariables(variables)

  return (
    <div className={variablesEditorStyles.container}>
      {label && <div className={variablesEditorStyles.label}>{label}</div>}

      <Editor
        language="json5"
        value={variables}
        onChange={setVariables}
        frame={frame}
        height={height}
      />

      {!parsed.ok && (
        <div className={variablesEditorStyles.error} role="alert">
          {parsed.message}
        </div>
      )}
    </div>
  )
}
