import { themeContract } from '@another-graphql-ide/style'
import { Compartment, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useLayoutEffect, useState } from 'react'

import { annotationGutter } from './annotation-gutter'
import { FindStore, findExtensions } from './find'
import { hoverCard, type HoverCard, type RenderHover } from './hover-card'
import {
  initialLineState,
  linePointer,
  lineStateField,
  selectLine,
  setLineData,
  syncSelected,
  type LineData,
  type SdlLocation,
} from './line-state'
import {
  NO_MESSAGES,
  initMessageRows,
  messageRows,
  setMessages,
  type SdlMessages,
} from './message-rows'
import { rowAtLine, sdlRows, type SdlRow } from './sdl-rows'
import { SDL_LINE_HEIGHT } from './sdl-theme'
import {
  setTypeHref,
  typeHrefField,
  typeLinks,
  type TypeHref,
} from './type-links'

export type UseSdlExtensionsParams = {
  /** Dimming, and the annotation column. Without any there is no column. */
  data?: LineData
  /** Rows under lines. */
  messages?: SdlMessages
  selected?: SdlLocation
  onSelect?: (row: SdlRow) => void
  reveal?: SdlLocation & { nonce: number }
  typeHref?: TypeHref
  renderHover?: RenderHover
  /** Hides the annotation column while true. */
  columnCollapsed?: boolean
}

const NO_DATA: LineData = {}

const showsColumn = ({ data, columnCollapsed }: UseSdlExtensionsParams) =>
  (data?.annotations !== undefined || data?.tags !== undefined) &&
  !columnCollapsed

/** Latest callback and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  slide?: Animation
  onSelect?: (row: SdlRow) => void
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
  base: Extension,
  params: UseSdlExtensionsParams,
  setPanel: (panel: FindPanel | null) => void,
  setCard: (update: (card: HoverCard | null) => HoverCard | null) => void
) => {
  const handlers = new Handlers()
  handlers.update(params)
  const column = new Compartment()
  const store = new FindStore()
  const { data = NO_DATA, selected } = params

  const extensions: Extension = [
    base,
    lineStateField.init(state => initialLineState(state, data, selected)),
    initMessageRows(params.messages),
    linePointer,
    typeLinks(params.typeHref),
    column.of(showsColumn(params) ? annotationGutter : []),
    findExtensions(store, panel =>
      setPanel(panel ? { ...panel, store } : null)
    ),
    hoverCard(
      (coordinate, side) => handlers.renderHover?.(coordinate, side),
      setCard
    ),
    // Only user selections are reported; host ones arrive as syncSelected.
    EditorView.updateListener.of(update => {
      for (const tr of update.transactions) {
        for (const effect of tr.effects) {
          if (effect.is(selectLine) && effect.value !== null) {
            handlers.onSelect?.(rowAtLine(tr.state, effect.value))
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
 * What every SDL view has: row states, type links, the annotation column,
 * search and the hover card, kept in step with the host's props. `base` is the
 * view's own, and must set `sdlRows`. The extensions are stable across
 * renders; `findPanel` is set once the panel opens.
 */
export const useSdlExtensions = (
  base: Extension,
  params: UseSdlExtensionsParams
): {
  extensions: Extension
  findPanel: FindPanel | null
  card: HoverCard | null
} => {
  const [findPanel, setFindPanel] = useState<FindPanel | null>(null)
  const [card, setCard] = useState<HoverCard | null>(null)
  const [{ handlers, column, extensions }] = useState(() =>
    createHandlers(base, params, setFindPanel, setCard)
  )
  const { data = NO_DATA, messages = NO_MESSAGES, reveal, typeHref } = params
  const { side, coordinate } = params.selected ?? {}
  const withColumn = showsColumn(params)

  useEffect(() => {
    handlers.update(params)
  })

  // These run after Editor's own effects, so the document is already current.
  useEffect(() => {
    const view = handlers.view
    if (!view) return
    const { data: last } = view.state.field(lineStateField)
    if (
      last.annotations === data.annotations &&
      last.tags === data.tags &&
      last.dimmed === data.dimmed
    ) {
      return
    }
    view.dispatch({ effects: setLineData.of(data) })
  })

  useEffect(() => {
    const view = handlers.view
    if (!view || view.state.field(messageRows).messages === messages) return
    view.dispatch({ effects: setMessages.of(messages) })
  }, [handlers, messages])

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
    const shown =
      line === null ? undefined : rowAtLine(view.state, line).coordinate
    if (shown === coordinate) return
    view.dispatch({
      effects: syncSelected.of(
        side && coordinate !== undefined ? { side, coordinate } : undefined
      ),
    })
  }, [handlers, side, coordinate])

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
      .facet(sdlRows)
      .lineOf(reveal.side, reveal.coordinate)
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
