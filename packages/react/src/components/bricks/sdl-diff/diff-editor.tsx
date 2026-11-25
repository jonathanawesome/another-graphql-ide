import { ViewPlugin, type EditorView } from '@codemirror/view'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Editor } from '../editor/editor'
import { FindBar } from '../sdl-shared/find-bar'
import { definitionClick } from '../sdl-shared/go-to-definition'
import type { RenderHover } from '../sdl-shared/hover-card'
import type { SdlRow } from '../sdl-shared/sdl-rows'
import { sdlTheme } from '../sdl-shared/sdl-theme'
import type { TypeHref } from '../sdl-shared/type-links'
import { useSdlExtensions } from '../sdl-shared/use-sdl-extensions'

import { diffDetailsExtension, setDetails } from './codemirror/diff-details'
import { diffFolds } from './codemirror/diff-folds'
import { diffRows } from './codemirror/diff-rows'
import { diffTheme } from './codemirror/diff-theme'
import type { DiffDetails } from './compare/diff-details'
import type { DiffView } from './compare/run-comparison'

const createBase = ({ rows, folds, lines }: DiffView) => {
  const handle: { view: EditorView | null } = { view: null }
  const extensions = [
    diffRows(rows, lines),
    diffFolds(folds),
    diffDetailsExtension(rows),
    definitionClick,
    sdlTheme,
    diffTheme,
    ViewPlugin.define(view => {
      handle.view = view
      return {
        destroy: () => {
          handle.view = null
        },
      }
    }),
  ]
  return { handle, extensions }
}

export type DiffEditorProps = {
  diff: DiffView
  details?: DiffDetails
  onSelect?: (row: SdlRow) => void
  typeHref?: TypeHref
  renderHover?: RenderHover
  theme?: 'light' | 'dark'
}

/** One diff in an editor. Mount another for the next diff. */
export const DiffEditor = ({
  diff,
  details,
  onSelect,
  typeHref,
  renderHover,
  theme,
}: DiffEditorProps) => {
  const [{ handle, extensions: base }] = useState(() => createBase(diff))

  // Runs after Editor's own effect, so the view exists.
  useEffect(() => {
    if (details) handle.view?.dispatch({ effects: setDetails.of(details) })
  }, [handle, details])

  const { extensions, findPanel, card } = useSdlExtensions(base, {
    onSelect,
    typeHref,
    renderHover,
  })

  return (
    <>
      <Editor
        value={diff.text}
        readOnly
        theme={theme}
        extensions={extensions}
      />
      {findPanel &&
        createPortal(
          <FindBar
            view={findPanel.view}
            store={findPanel.store}
            withColumn={false}
          />,
          findPanel.dom
        )}
      {card &&
        renderHover &&
        createPortal(
          renderHover(card.coordinate, card.side),
          card.dom,
          `${card.side} ${card.coordinate}`
        )}
    </>
  )
}
