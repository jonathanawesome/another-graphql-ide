import { Compartment, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useState } from 'react'

import { annotationGutter } from './codemirror/annotation-gutter'
import { FindStore, findExtensions } from './codemirror/find'
import {
  coordinateAtLine,
  initialLineState,
  linePointer,
  lineStateField,
  selectLine,
  setLineData,
  syncSelected,
  type LineData,
} from './codemirror/line-state'
import { sdlExtensions } from './codemirror/sdl-extensions'
import type { Coordinate } from './codemirror/sdl-index'

export type UseSdlExtensionsParams = LineData & {
  selected?: Coordinate
  onSelect?: (coordinate: Coordinate | undefined) => void
}

const hasColumn = ({ annotations, tags }: LineData) =>
  annotations !== undefined || tags !== undefined

/** Latest callback and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  onSelect?: (coordinate: Coordinate | undefined) => void

  update(onSelect: UseSdlExtensionsParams['onSelect']) {
    this.onSelect = onSelect
  }
}

/** The open find panel, for the find bar to render into. */
export type FindPanel = { view: EditorView; dom: HTMLElement; store: FindStore }

const createHandlers = (
  params: UseSdlExtensionsParams,
  setPanel: (panel: FindPanel | null) => void
) => {
  const handlers = new Handlers()
  handlers.update(params.onSelect)
  const column = new Compartment()
  const store = new FindStore()
  const { annotations, tags, dimmed, selected } = params

  const extensions: Extension = [
    sdlExtensions,
    lineStateField.init(state =>
      initialLineState(state, { annotations, tags, dimmed }, selected)
    ),
    linePointer,
    column.of(hasColumn(params) ? annotationGutter : []),
    findExtensions(store, panel =>
      setPanel(panel ? { ...panel, store } : null)
    ),
    // Only user selections are reported; host ones arrive as syncSelected.
    EditorView.updateListener.of(update => {
      for (const tr of update.transactions) {
        for (const effect of tr.effects) {
          if (effect.is(selectLine)) {
            handlers.onSelect?.(coordinateAtLine(tr.state, effect.value))
          }
        }
      }
    }),
    ViewPlugin.define(view => {
      handlers.view = view
      return {
        destroy: () => {
          handlers.view = null
        },
      }
    }),
  ]

  return { handlers, column, extensions }
}

/**
 * The SDL viewer's extensions: colors, folding, go-to-definition, row states,
 * the annotation column and search, kept in step with the host's props. The
 * extensions are stable across renders; `findPanel` is set once the panel opens.
 */
export const useSdlExtensions = (
  params: UseSdlExtensionsParams
): { extensions: Extension; findPanel: FindPanel | null } => {
  const [findPanel, setFindPanel] = useState<FindPanel | null>(null)
  const [{ handlers, column, extensions }] = useState(() =>
    createHandlers(params, setFindPanel)
  )
  const { annotations, tags, dimmed, selected, onSelect } = params
  const withColumn = hasColumn(params)

  useEffect(() => {
    handlers.update(onSelect)
  })

  // These run after Editor's own effects, so the document is already current.
  useEffect(() => {
    const view = handlers.view
    if (!view) return
    const { data } = view.state.field(lineStateField)
    if (
      data.annotations === annotations &&
      data.tags === tags &&
      data.dimmed === dimmed
    ) {
      return
    }
    view.dispatch({ effects: setLineData.of({ annotations, tags, dimmed }) })
  }, [handlers, annotations, tags, dimmed])

  useEffect(() => {
    const view = handlers.view
    if (!view || (column.get(view.state) === annotationGutter) === withColumn) {
      return
    }
    view.dispatch({
      effects: column.reconfigure(withColumn ? annotationGutter : []),
    })
  }, [handlers, column, withColumn])

  useEffect(() => {
    const view = handlers.view
    if (!view) return
    const line = view.state.field(lineStateField).selected
    if (coordinateAtLine(view.state, line) === selected) return
    view.dispatch({ effects: syncSelected.of(selected) })
  }, [handlers, selected])

  return { extensions, findPanel }
}
