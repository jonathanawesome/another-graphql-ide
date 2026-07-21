import type { EditorView } from '@codemirror/view'
import type { GraphQLSchema } from 'graphql'
import { useEffect, useRef } from 'react'

import { useTheme } from '../../../../style'
import {
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
  language: EditorLanguage
  schema?: GraphQLSchema
  readOnly?: boolean
  onChange?: (value: string) => void
  onActiveOperationChange?: (name: string | undefined) => void
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
  onChange,
  onActiveOperationChange,
}: UseCodemirrorParams) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { resolvedTheme } = useTheme()

  // Keep the latest onChange without recreating the view; guard programmatic
  // value syncs from re-firing it.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onActiveOperationChangeRef = useRef(onActiveOperationChange)
  onActiveOperationChangeRef.current = onActiveOperationChange
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
      onChange: next => {
        if (!isSyncingRef.current) onChangeRef.current?.(next)
      },
      onActiveOperationChange: (name: string | undefined) =>
        onActiveOperationChangeRef.current?.(name),
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Mount-only; subsequent prop changes are handled by the effects below.
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

  // Read-only changes.
  useEffect(() => {
    const view = viewRef.current
    if (view) reconfigureReadOnly(view, readOnly)
  }, [readOnly])

  // Controlled value: push external changes into the editor.
  useEffect(() => {
    const view = viewRef.current
    if (!view || value === undefined) return

    const current = view.state.doc.toString()
    if (value === current) return

    isSyncingRef.current = true
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    })
    isSyncingRef.current = false
  }, [value])

  return containerRef
}
