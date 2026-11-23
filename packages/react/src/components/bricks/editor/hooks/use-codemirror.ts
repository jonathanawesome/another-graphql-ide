import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { GraphQLSchema } from 'graphql'
import { useContext, useEffect, useRef } from 'react'

import { ThemeContext } from '../../../../style'
import {
  reconfigureExtensions,
  reconfigureLanguage,
  reconfigureReadOnly,
  reconfigureTheme,
} from '../codemirror/compartments'
import { updateSchema } from '../codemirror/languages'
import { createEditorView } from '../codemirror/setup'
import type { EditorLanguage } from '../codemirror/types'

export type UseCodemirrorParams = {
  /** Controlled document value. Kept in sync with the editor when provided. */
  value?: string
  /** Initial document value for uncontrolled usage. */
  defaultValue?: string
  language?: EditorLanguage
  schema?: GraphQLSchema
  readOnly?: boolean
  /** Overrides the surrounding ThemeProvider. Light when neither is set. */
  theme?: 'light' | 'dark'
  /** Caller extensions. Keep the value stable; a new one reconfigures. */
  extensions?: Extension
  onChange?: (value: string) => void
}

/**
 * The single bridge between React and CodeMirror. Creates the EditorView once
 * on mount and keeps it in sync with props through the reconfigure helpers in
 * `../codemirror`. Contains no CodeMirror wiring of its own — only lifecycle.
 */
export const useCodemirror = ({
  value,
  defaultValue,
  language,
  schema,
  readOnly = false,
  theme,
  extensions,
  onChange,
}: UseCodemirrorParams) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // Read directly, not through useTheme, so Editor works without a provider.
  const themeContext = useContext(ThemeContext)
  const resolvedTheme = theme ?? themeContext?.resolvedTheme ?? 'light'

  // Keep the latest callbacks without recreating the view; guard programmatic
  // value syncs from re-firing them.
  //
  // Assigned in an effect rather than during render, so a render React throws
  // away cannot leave its callbacks behind. CodeMirror only invokes these from
  // its update listener, which is always after effects have flushed.
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  const isSyncingRef = useRef(false)

  // Track the previous language so a schema-only change can use the cheaper
  // updateSchema path instead of a full language reconfigure.
  const prevLanguageRef = useRef(language)

  // Create the EditorView once on mount.
  useEffect(() => {
    if (!containerRef.current) return

    const view = createEditorView({
      parent: containerRef.current,
      doc: value ?? defaultValue ?? '',
      language,
      schema,
      readOnly,
      dark: resolvedTheme === 'dark',
      extensions,
      onChange: next => {
        if (!isSyncingRef.current) onChangeRef.current?.(next)
      },
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Mount-only; subsequent prop changes are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps would rebuild the view and lose caret, history and scroll
  }, [])

  // Language / schema changes.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    if (prevLanguageRef.current === language && language === 'graphql') {
      updateSchema(view, schema)
    } else {
      reconfigureLanguage(view, language, schema)
    }
    prevLanguageRef.current = language
  }, [language, schema])

  // Theme changes.
  useEffect(() => {
    const view = viewRef.current
    if (view) reconfigureTheme(view, resolvedTheme === 'dark')
  }, [resolvedTheme])

  // Caller extensions. Skips the mount pass, which already installed them.
  const mountedExtensionsRef = useRef(extensions)
  useEffect(() => {
    const view = viewRef.current
    if (!view || mountedExtensionsRef.current === extensions) return
    mountedExtensionsRef.current = extensions
    reconfigureExtensions(view, extensions)
  }, [extensions])

  // Read-only changes.
  useEffect(() => {
    const view = viewRef.current
    if (view) reconfigureReadOnly(view, readOnly)
  }, [readOnly])

  // Controlled value: push external changes into the editor as a minimal-range
  // replace (common prefix/suffix diff) so the caret and undo history survive
  // programmatic setQuery, e.g. schema tree inserts.
  useEffect(() => {
    const view = viewRef.current
    if (!view || value === undefined) return

    const current = view.state.doc.toString()
    if (value === current) return

    let start = 0
    const minLen = Math.min(current.length, value.length)
    while (start < minLen && current[start] === value[start]) start++
    let endCur = current.length
    let endNew = value.length
    while (
      endCur > start &&
      endNew > start &&
      current[endCur - 1] === value[endNew - 1]
    ) {
      endCur--
      endNew--
    }

    isSyncingRef.current = true
    view.dispatch({
      changes: { from: start, to: endCur, insert: value.slice(start, endNew) },
    })
    isSyncingRef.current = false
  }, [value])

  return containerRef
}
