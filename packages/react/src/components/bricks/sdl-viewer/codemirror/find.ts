import {
  SearchQuery,
  getSearchQuery,
  openSearchPanel,
  search,
  setSearchQuery,
} from '@codemirror/search'
import { Prec, type EditorState, type Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, keymap } from '@codemirror/view'

/** A plain-text, case-insensitive query, as the find bar searches. */
export const queryFor = (text: string) =>
  new SearchQuery({ search: text, literal: true })

/** Start offsets of every match, in document order. */
export const findMatches = (state: EditorState, text: string) => {
  const query = queryFor(text)
  const matches: number[] = []
  if (!query.valid) return matches
  const cursor = query.getCursor(state)
  for (let step = cursor.next(); !step.done; step = cursor.next()) {
    matches.push(step.value.from)
  }
  return matches
}

/** What the find bar renders from. `doc` counts document changes. */
export type FindSnapshot = {
  query: string
  from: number
  to: number
  doc: number
}

/** The query and selection, for useSyncExternalStore. */
export class FindStore {
  private snapshot: FindSnapshot = { query: '', from: 0, to: 0, doc: 0 }
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot

  sync(state: EditorState, docChanged: boolean) {
    const query = getSearchQuery(state).search
    const { from, to } = state.selection.main
    const last = this.snapshot
    const doc = docChanged ? last.doc + 1 : last.doc
    if (
      last.query === query &&
      last.from === from &&
      last.to === to &&
      last.doc === doc
    ) {
      return
    }
    this.snapshot = { query, from, to, doc }
    for (const listener of this.listeners) listener()
  }
}

/** Clears the query and keeps the panel open. */
export const clearQuery = (view: EditorView) => {
  view.dispatch({ effects: setSearchQuery.of(queryFor('')) })
  return true
}

/**
 * CodeMirror's search, with its panel kept open at the top as an empty element
 * for the host to render the find bar into. Match highlighting only draws
 * while the panel is open.
 */
export const findExtensions = (
  store: FindStore,
  onPanel: (panel: { view: EditorView; dom: HTMLElement } | null) => void
): Extension => [
  search({
    top: true,
    createPanel: view => {
      const dom = document.createElement('div')
      dom.className = 'cm-sdl-find'
      onPanel({ view, dom })
      return { dom, top: true, destroy: () => onPanel(null) }
    },
  }),
  // A read-only view is not focusable, so its keymaps would never run.
  EditorView.contentAttributes.of({ tabindex: '0' }),
  // The default Escape closes the panel; here it only clears the query.
  Prec.high(keymap.of([{ key: 'Escape', run: clearQuery }])),
  EditorView.updateListener.of(update => {
    store.sync(update.state, update.docChanged)
  }),
  ViewPlugin.define(view => {
    let live = true
    // A view can't dispatch while it is being built.
    queueMicrotask(() => {
      if (live) openSearchPanel(view)
    })
    return {
      destroy: () => {
        live = false
      },
    }
  }),
]
