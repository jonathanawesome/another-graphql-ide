import { ViewPlugin, type EditorView } from '@codemirror/view'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Editor } from '../editor/editor'
import { FindStore, findExtensions } from '../sdl-shared/find'
import { FindBar } from '../sdl-shared/find-bar'
import { sdlTheme } from '../sdl-shared/sdl-theme'

import { diffFolds } from './codemirror/diff-folds'
import { diffRows } from './codemirror/diff-rows'
import { diffTheme } from './codemirror/diff-theme'
import { diffTokens, setTokens } from './codemirror/diff-tokens'
import type { DiffView } from './compare/run-comparison'
import type { Tokens } from './compare/unify-tokens'

type Panel = { view: EditorView; dom: HTMLElement }

const createExtensions = (
  { rows, folds, lines }: DiffView,
  store: FindStore,
  setPanel: (panel: Panel | null) => void,
  setView: (view: EditorView | null) => void
) => [
  diffRows(rows, lines),
  diffFolds(folds),
  diffTokens,
  sdlTheme,
  diffTheme,
  findExtensions(store, setPanel),
  ViewPlugin.define(view => {
    setView(view)
    return { destroy: () => setView(null) }
  }),
]

/** One diff in an editor. Mount another for the next diff. */
export const DiffEditor = ({
  diff,
  tokens,
  theme,
}: {
  diff: DiffView
  tokens?: Tokens
  theme?: 'light' | 'dark'
}) => {
  const [panel, setPanel] = useState<Panel | null>(null)
  const [{ handle, store, extensions }] = useState(() => {
    const handle: { view: EditorView | null } = { view: null }
    const store = new FindStore()
    const extensions = createExtensions(diff, store, setPanel, view => {
      handle.view = view
    })
    return { handle, store, extensions }
  })

  // Runs after Editor's own effect, so the view exists.
  useEffect(() => {
    if (tokens) handle.view?.dispatch({ effects: setTokens.of(tokens) })
  }, [handle, tokens])

  return (
    <>
      <Editor
        value={diff.text}
        readOnly
        theme={theme}
        extensions={extensions}
      />
      {panel &&
        createPortal(
          <FindBar view={panel.view} store={store} withColumn={false} />,
          panel.dom
        )}
    </>
  )
}
