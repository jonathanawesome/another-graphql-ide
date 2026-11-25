import { Facet, type EditorState } from '@codemirror/state'

import type { Coordinate, SdlToken } from './sdl-index'

/** Which document a row belongs to. A single document is all `after`. */
export type SdlSide = 'before' | 'after'

/** What a line shows: its side, and the coordinate defined on it, if any. */
export type SdlRow = { side: SdlSide; coordinate: Coordinate | undefined }

/** What a view knows about its own text. Lines are 1-based. */
export type SdlRows = {
  row: (line: number) => SdlRow
  lineOf: (side: SdlSide, coordinate: Coordinate) => number | undefined
  /** Tokens that overlap a range, in order. */
  tokens: (from: number, to: number) => Iterable<SdlToken>
}

const noRows: SdlRows = {
  row: () => ({ side: 'after', coordinate: undefined }),
  lineOf: () => undefined,
  tokens: () => [],
}

/** Set by each view, so links, annotations and the rest work in any of them. */
export const sdlRows = Facet.define<SdlRows, SdlRows>({
  combine: ([rows]) => rows ?? noRows,
})

/** The row on a line. */
export const rowAtLine = (state: EditorState, line: number) =>
  state.facet(sdlRows).row(line)
