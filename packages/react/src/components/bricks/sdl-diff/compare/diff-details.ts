import { indexSdl } from '../../sdl-shared/sdl-index'
import type { SdlSide } from '../../sdl-shared/sdl-rows'

import type { Comparison } from './compare-sdl'
import { coordinateTable, type CoordinateTable } from './coordinate-table'
import { unifyTokens, type Tokens } from './unify-tokens'

/** What a parse of both documents adds to a diff. */
export type DiffDetails = {
  tokens: Tokens
  coordinates: Record<SdlSide, CoordinateTable>
}

export const diffDetails = (comparison: Comparison): DiffDetails => {
  const { before, after } = comparison
  const newer = indexSdl(after.text)
  const same = before.text === after.text
  const older = same ? newer : indexSdl(before.text)
  const table = coordinateTable(newer, after.count)
  return {
    tokens: unifyTokens(comparison, older.tokens, newer.tokens),
    coordinates: {
      before: same ? table : coordinateTable(older, before.count),
      after: table,
    },
  }
}

/** The arrays in there, which a worker can hand over rather than copy. */
export const transferables = ({ tokens, coordinates }: DiffDetails) => {
  const tables = [coordinates.before, coordinates.after]
  const arrays = [
    ...Object.values(tokens),
    ...tables.flatMap(({ starts, lines, atLine }) => [starts, lines, atLine]),
  ]
  // Both sides share a table when the documents are equal.
  return [...new Set(arrays.map(array => array.buffer))]
}
