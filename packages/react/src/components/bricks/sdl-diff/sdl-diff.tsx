import { useEffect, useRef, type ReactNode } from 'react'

import { LoadingShell } from '../sdl-shared/loading-shell'
import { sdlFrameStyles as frameStyles } from '../sdl-shared/sdl-frame.css'

import type { SdlDiffKind } from './compare/compare-sdl'
import { DiffEditor } from './diff-editor'
import { sdlDiffStyles as styles } from './sdl-diff.css'
import { useSdlComparison } from './use-sdl-comparison'

/** What a comparison found, and how many lines differ. */
export type SdlDiffResult = {
  kind: SdlDiffKind
  /** Lines only in `after`. */
  added: number
  /** Lines only in `before`. */
  removed: number
}

export type SdlDiffProps = {
  /** The old schema as SDL text. */
  before: string
  /** The new schema as SDL text. */
  after: string
  /** Unchanged lines kept around each change before a run folds. */
  context?: number
  /** Placeholder lines, e.g. while the host fetches either document. */
  loading?: boolean
  /** Shown instead of the diff when the documents are too large to compare. */
  tooLarge?: ReactNode
  /** Called with what each comparison found. */
  onResult?: (result: SdlDiffResult) => void
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Optional visual frame around the diff. */
  frame?: 'none' | 'bordered'
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
}

/**
 * A read-only view of what changed between two SDL documents: added, removed
 * and unchanged lines in one column, long unchanged runs folded, with colors
 * and a find bar. Documents with no changes show `after` in full. Compares line
 * by line in a worker, so pass both documents sorted to ignore order.
 * Prop-driven; needs no AGIProvider.
 */
export const SdlDiff = ({
  before,
  after,
  context = 3,
  loading = false,
  tooLarge = 'This diff is too large to show.',
  onResult,
  theme,
  frame,
  height,
}: SdlDiffProps) => {
  const { id, result, tokens } = useSdlComparison(
    { before, after, context },
    !loading
  )

  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  })
  useEffect(() => {
    if (!result) return
    const { kind } = result
    onResultRef.current?.(
      kind === 'too-large'
        ? { kind, added: 0, removed: 0 }
        : { kind, added: result.added, removed: result.removed }
    )
  }, [result])

  return (
    <div
      className={frameStyles.root({ frame })}
      style={height !== undefined ? { height } : undefined}
      aria-busy={result === undefined || undefined}
    >
      <div className={frameStyles.body}>
        {!result && (
          <div className={frameStyles.overlay}>
            <LoadingShell withColumn={false} />
          </div>
        )}
        {result?.kind === 'too-large' && (
          <div className={styles.notice}>{tooLarge}</div>
        )}
        {result && result.kind !== 'too-large' && (
          <div className={frameStyles.editor}>
            <DiffEditor key={id} diff={result} tokens={tokens} theme={theme} />
          </div>
        )}
      </div>
    </div>
  )
}
