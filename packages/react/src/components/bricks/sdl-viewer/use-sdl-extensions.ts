import { themeContract } from '@another-graphql-ide/style'
import { Compartment, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'

import { annotationGutter } from './codemirror/annotation-gutter'
import { FindStore, findExtensions } from './codemirror/find'
import { hoverCard, type HoverCard } from './codemirror/hover-card'
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
import { SDL_LINE_HEIGHT, sdlExtensions } from './codemirror/sdl-extensions'
import { sdlField } from './codemirror/sdl-field'
import type { Coordinate } from './codemirror/sdl-index'
import {
  setTypeHref,
  typeHrefField,
  typeLinks,
  type TypeHref,
} from './codemirror/type-links'

export type UseSdlExtensionsParams = LineData & {
  selected?: Coordinate
  onSelect?: (coordinate: Coordinate | undefined) => void
  reveal?: { coordinate: Coordinate; nonce: number }
  typeHref?: TypeHref
  renderHover?: RenderHover
  /** Hides the annotation column while true. */
  columnCollapsed?: boolean
}

export type RenderHover = (coordinate: Coordinate) => ReactNode

const showsColumn = ({
  annotations,
  tags,
  columnCollapsed,
}: UseSdlExtensionsParams) =>
  (annotations !== undefined || tags !== undefined) && !columnCollapsed

/** Latest callback and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  slide?: Animation
  onSelect?: (coordinate: Coordinate | undefined) => void
  renderHover?: RenderHover

  update({ onSelect, renderHover }: UseSdlExtensionsParams) {
    this.onSelect = onSelect
    this.renderHover = renderHover
  }
}

const COLUMN_SLIDE_MS = 200
const EASING_VAR = themeContract.motion.authentic.slice(4, -1)

/** Shows or hides the annotation column, sliding its width. */
const slideColumn = (
  view: EditorView,
  handlers: Handlers,
  column: Compartment,
  show: boolean
) => {
  const mount = (on: boolean) =>
    view.dispatch({ effects: column.reconfigure(on ? annotationGutter : []) })
  const find = () => view.dom.querySelector<HTMLElement>('.cm-gutters-after')

  // A toggle mid-slide continues from the current width.
  const interrupted = handlers.slide
    ? find()?.getBoundingClientRect().width
    : undefined
  handlers.slide?.cancel()
  handlers.slide = undefined

  if (show && column.get(view.state) !== annotationGutter) mount(true)
  const dom = find()
  const still =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!dom || typeof dom.animate !== 'function' || still) {
    if (!show) mount(false)
    return
  }

  const full = dom.offsetWidth
  const from = interrupted ?? (show ? 0 : full)
  const easing =
    getComputedStyle(dom).getPropertyValue(EASING_VAR).trim() || 'ease'
  const slide = dom.animate(
    { width: [`${from}px`, `${show ? full : 0}px`] },
    { duration: COLUMN_SLIDE_MS, easing }
  )
  handlers.slide = slide
  slide.onfinish = () => {
    handlers.slide = undefined
    if (!show) mount(false)
    view.requestMeasure()
  }
}

/** The open find panel, for the find bar to render into. */
export type FindPanel = { view: EditorView; dom: HTMLElement; store: FindStore }

const createHandlers = (
  params: UseSdlExtensionsParams,
  setPanel: (panel: FindPanel | null) => void,
  setCard: (update: (card: HoverCard | null) => HoverCard | null) => void
) => {
  const handlers = new Handlers()
  handlers.update(params)
  const column = new Compartment()
  const store = new FindStore()
  const { annotations, tags, dimmed, selected } = params

  const extensions: Extension = [
    sdlExtensions,
    lineStateField.init(state =>
      initialLineState(state, { annotations, tags, dimmed }, selected)
    ),
    linePointer,
    typeLinks(params.typeHref),
    column.of(showsColumn(params) ? annotationGutter : []),
    findExtensions(store, panel =>
      setPanel(panel ? { ...panel, store } : null)
    ),
    hoverCard(coordinate => handlers.renderHover?.(coordinate), setCard),
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
          handlers.slide?.cancel()
          handlers.view = null
        },
      }
    }),
  ]

  return { handlers, column, extensions }
}

/**
 * The SDL viewer's extensions: colors, folding, go-to-definition, row states,
 * the annotation column, search and the hover card, kept in step with the host's props. The
 * extensions are stable across renders; `findPanel` is set once the panel opens.
 */
export const useSdlExtensions = (
  params: UseSdlExtensionsParams
): {
  extensions: Extension
  findPanel: FindPanel | null
  card: HoverCard | null
} => {
  const [findPanel, setFindPanel] = useState<FindPanel | null>(null)
  const [card, setCard] = useState<HoverCard | null>(null)
  const [{ handlers, column, extensions }] = useState(() =>
    createHandlers(params, setFindPanel, setCard)
  )
  const { annotations, tags, dimmed, selected, reveal, typeHref } = params
  const withColumn = showsColumn(params)

  useEffect(() => {
    handlers.update(params)
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

  // A layout effect, so the find bar's passive effects see the new column.
  useLayoutEffect(() => {
    const view = handlers.view
    if (!view) return
    const mounted = column.get(view.state) === annotationGutter
    if (mounted === withColumn && !handlers.slide) return
    slideColumn(view, handlers, column, withColumn)
  }, [handlers, column, withColumn])

  useEffect(() => {
    const view = handlers.view
    if (!view) return
    const line = view.state.field(lineStateField).selected
    if (coordinateAtLine(view.state, line) === selected) return
    view.dispatch({ effects: syncSelected.of(selected) })
  }, [handlers, selected])

  useEffect(() => {
    const view = handlers.view
    if (!view || view.state.field(typeHrefField) === typeHref) return
    view.dispatch({ effects: setTypeHref.of(typeHref) })
  }, [handlers, typeHref])

  // Editor's effects run first, so the document already holds the line.
  useEffect(() => {
    const view = handlers.view
    if (!view || !reveal) return
    const line = view.state
      .field(sdlField)
      .index.lineOfCoordinate.get(reveal.coordinate)
    if (line === undefined) return
    view.dispatch({
      effects: EditorView.scrollIntoView(view.state.doc.line(line).from, {
        y: 'start',
        yMargin: SDL_LINE_HEIGHT * 2,
      }),
    })
    // Keyed on nonce so each request applies once, even to the same coordinate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the whole object would re-apply the same reveal
  }, [handlers, reveal?.nonce])

  return { extensions, findPanel, card }
}
