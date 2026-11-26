import {
  getDiagnostics,
  getHoverInformation,
  type Position,
} from 'graphql-language-service'
import { describe, expect, it } from 'vitest'

import { indexContext } from '../../sdl-editor/check/context-index'
import { diagnoseSdl } from '../../sdl-editor/check/diagnose-sdl'
import { makeSupergraph, subgraphSdl } from '../../sdl-viewer/__fixtures__/sdl'

import { schemaCases } from './stress-measurements'

/** The identifier the caret sits inside. */
const wordAt = (source: string, position: Position): string => {
  const line = source.split('\n')[position.line] ?? ''
  const before = /[A-Za-z0-9_]*$/.exec(line.slice(0, position.character))?.[0]
  const after = /^[A-Za-z0-9_]*/.exec(line.slice(position.character))?.[0]
  return `${before ?? ''}${after ?? ''}`
}

/**
 * The benchmark's fixtures have to mean what they say. A `validQuery` that does
 * not actually validate turns "lint (valid)" into a second copy of
 * "lint (unknown field)", and the numbers look plausible either way.
 */
describe.each(schemaCases.map(c => [c.variant, c] as const))(
  'stress fixtures: %s',
  (_variant, testCase) => {
    it('lints clean against its schema', () => {
      expect(getDiagnostics(testCase.validQuery, testCase.schema)).toEqual([])
    })

    it('hovers over a real field', () => {
      const hover = getHoverInformation(
        testCase.schema,
        testCase.validQuery,
        testCase.hoverPos
      )

      // Hover describes the field under the caret, so the position and the
      // query cannot drift apart without this failing.
      expect(JSON.stringify(hover)).toContain(
        wordAt(testCase.validQuery, testCase.hoverPos)
      )
    })
  }
)

// A supergraph with problems would time the message path, not a clean check.
describe('stress fixtures: sdl editor', () => {
  it('checks the supergraph clean', () => {
    expect(diagnoseSdl(makeSupergraph(4000))).toEqual([])
  })

  it('checks the subgraph clean against the supergraph', () => {
    const context = indexContext(makeSupergraph(4000))
    expect(diagnoseSdl(subgraphSdl, context)).toEqual([])
  })
})
