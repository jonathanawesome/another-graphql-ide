import type { Extension } from '@codemirror/state'

import { Editor } from '../editor/editor'

import { codeEditorStyles } from './code-editor.css'
import type { Report } from './diagnostics'

/** What SdlEditor and JsonEditor share. */
export type CodeEditorProps = {
  /** Controlled text. Provide together with `onChange`. */
  value?: string
  /** Initial text for uncontrolled usage. */
  defaultValue?: string
  /** Called with the new text on every edit. */
  onChange?: (value: string) => void
  /**
   * Called after each check, on mount too, with the problems found and the text
   * that was checked. Checks wait for a pause in typing, so compare that text
   * with the current value before relying on the result.
   */
  onDiagnostics?: Report
  /** Render the text read-only. It is still checked. */
  readOnly?: boolean
  /** Accessible name. */
  label?: string
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Optional visual frame around the editor. */
  frame?: 'none' | 'bordered'
  /** Defaults to filling the parent. `auto` grows with the text. */
  height?: number | string
  minHeight?: number | string
}

type Props = Omit<CodeEditorProps, 'onDiagnostics' | 'label'> & {
  extensions: Extension
}

export const CodeEditor = ({ frame, height, minHeight, ...editor }: Props) => (
  <div
    className={codeEditorStyles.root({ frame })}
    style={{ height, minHeight }}
  >
    <Editor {...editor} />
  </div>
)
