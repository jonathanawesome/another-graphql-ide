import { describe, expect, it } from 'vitest'

import { indexSdl } from '../../sdl-shared/sdl-index'
import { subgraphSdl } from '../../sdl-viewer/__fixtures__/sdl'

import {
  coordinateAt,
  coordinateTable,
  lineOfCoordinate,
} from './coordinate-table'

const lineCount = subgraphSdl.split('\n').length

describe('coordinateTable', () => {
  it('agrees with the index both ways', () => {
    const index = indexSdl(subgraphSdl)
    const table = coordinateTable(index, lineCount)

    for (let line = 1; line <= lineCount; line++) {
      expect(coordinateAt(table, line)).toBe(index.coordinateAtLine.get(line))
    }
    for (const [coordinate, line] of index.lineOfCoordinate) {
      expect(lineOfCoordinate(table, coordinate)).toBe(line)
    }
  })

  it('knows nothing of other lines and names', () => {
    const table = coordinateTable(indexSdl(subgraphSdl), lineCount)

    expect(coordinateAt(table, lineCount + 1)).toBeUndefined()
    expect(lineOfCoordinate(table, 'Use')).toBeUndefined()
    expect(lineOfCoordinate(table, '')).toBeUndefined()
    expect(
      lineOfCoordinate(coordinateTable(indexSdl(''), 0), 'User')
    ).toBeUndefined()
  })
})
