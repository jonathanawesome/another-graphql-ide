import {
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'

import { sdlRows } from './sdl-rows'

export type TypeHref = (typeName: string) => string | undefined

/** The host's link builder changed. */
export const setTypeHref = StateEffect.define<TypeHref | undefined>()

/** The host's link builder for type names, if any. */
export const typeHrefField = StateField.define<TypeHref | undefined>({
  create: () => undefined,
  update: (value, tr) => {
    for (const effect of tr.effects) {
      if (effect.is(setTypeHref)) value = effect.value
    }
    return value
  },
})

const linkMark = (href: string) =>
  Decoration.mark({
    tagName: 'a',
    // One tab stop for the viewer, not one per type name.
    attributes: { href, class: 'cm-sdl-link', tabindex: '-1' },
  })

// Links for the visible lines only, so a huge schema costs the same as a small one.
const buildLinks = (view: EditorView): DecorationSet => {
  const typeHref = view.state.field(typeHrefField)
  if (!typeHref) return Decoration.none
  const { tokens } = view.state.facet(sdlRows)
  const builder = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    for (const token of tokens(from, to)) {
      if (token.kind !== 'type') continue
      const href = typeHref(view.state.sliceDoc(token.from, token.to))
      if (href) builder.add(token.from, token.to, linkMark(href))
    }
  }
  return builder.finish()
}

const typeLinksPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildLinks(view)
    }

    update(update: ViewUpdate) {
      const hrefChanged =
        update.state.field(typeHrefField) !==
        update.startState.field(typeHrefField)
      const rowsChanged =
        update.state.facet(sdlRows) !== update.startState.facet(sdlRows)
      if (rowsChanged || update.viewportChanged || hrefChanged) {
        this.decorations = buildLinks(update.view)
      }
    }
  },
  { decorations: plugin => plugin.decorations }
)

// A plain click selects the row, and Cmd/Ctrl-click goes to the definition,
// so neither follows the link. Shift-Cmd/Ctrl-click, middle-click and the
// context menu still open it.
const linkClick = EditorView.domEventHandlers({
  click(event) {
    if (!(event.target instanceof Element)) return false
    if (!event.target.closest('a.cm-sdl-link')) return false
    const newTab = event.shiftKey && (event.metaKey || event.ctrlKey)
    if (!newTab) event.preventDefault()
    return false
  },
})

/** Type names as links to the host's page for each type. */
export const typeLinks = (initial: TypeHref | undefined): Extension => [
  typeHrefField.init(() => initial),
  typeLinksPlugin,
  linkClick,
]
