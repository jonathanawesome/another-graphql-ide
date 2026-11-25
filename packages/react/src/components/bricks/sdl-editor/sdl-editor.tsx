import { CodeEditor, type CodeEditorProps } from '../sdl-shared/code-editor'

import { useSdlEditorExtensions } from './use-sdl-editor-extensions'

export type SdlEditorProps = CodeEditorProps & {
  /**
   * SDL that also counts as defined, e.g. the published schema. It is not
   * checked itself, and the document wins where both define a name.
   */
  contextSdl?: string
  /**
   * Shown beside completions that come from `contextSdl`, e.g. "published".
   * Defaults to what each name is, such as "enum".
   */
  contextLabel?: string
}

/**
 * An editor for SDL: colors, folding, completion of type and directive names,
 * and problems shown under their lines and reported to the host. A type that
 * nothing defines is a warning, everything else an error. Prop-driven; needs no
 * AGIProvider.
 */
export const SdlEditor = ({
  contextSdl,
  contextLabel,
  onDiagnostics,
  label,
  ...editor
}: SdlEditorProps) => {
  const extensions = useSdlEditorExtensions({
    contextSdl,
    contextLabel,
    onDiagnostics,
    label,
  })

  return <CodeEditor {...editor} extensions={extensions} />
}
