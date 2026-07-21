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
  onSelectionChange?: (offset: number) => void
  /**
   * A one-shot request to move the caret or select a range, applied once per
   * `nonce`. Used by state-driven edits (e.g. schema tree inserts) to place the
   * cursor or select a placeholder to type over.
   */
  pendingSelection?: { anchor: number; head: number; nonce: number }
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
  onSelectionChange,
  pendingSelection,
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
  const onSelectionChangeRef = useRef(onSelectionChange)
  onSelectionChangeRef.current = onSelectionChange
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
      onSelectionChange: (offset: number) =>
        onSelectionChangeRef.current?.(offset),
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

  // One-shot caret move requested by state (declared after the value sync so
  // the document is already updated when this runs). A selection-only dispatch
  // changes no text, so it never re-fires onChange.
  useEffect(() => {
    const view = viewRef.current
    if (!view || !pendingSelection) return
    const max = view.state.doc.length
    const anchor = Math.min(pendingSelection.anchor, max)
    const head = Math.min(pendingSelection.head, max)
    view.dispatch({ selection: { anchor, head } })
    view.focus()
    // Keyed on nonce so each toggle applies once, even to a repeated range.
  }, [pendingSelection?.nonce])

  return containerRef
}
