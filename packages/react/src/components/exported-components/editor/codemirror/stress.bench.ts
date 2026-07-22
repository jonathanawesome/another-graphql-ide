import {
  graphiqlTestSchema,
  performanceTestSchema,
} from '@another-graphql-ide/shared'
import {
  buildClientSchema,
  introspectionFromSchema,
  type IntrospectionQuery,
} from 'graphql'
import {
  getAutocompleteSuggestions,
  getDiagnostics,
  getHoverInformation,
  getOperationFacts,
  Position,
} from 'graphql-language-service'
import { bench, describe } from 'vitest'

import { makeLargeDocument } from './__fixtures__/large-doc'
import {
  getOperationRanges,
  selectActiveOperationIndex,
} from './active-operation'

/**
 * Benchmarks for the main-thread graphql-language-service work that cm6-graphql
 * (completion + lint) and graphqlHover wrap. cm6-graphql runs these on the main
 * thread, unlike monaco-graphql's web worker, so these numbers are the crux of
 * whether the CodeMirror migration holds up on large schemas.
 *
 * Each schema-sensitive path runs against a baseline schema and the ~11,800-type
 * stress schema, so the gap proves the cost scales with schema size and lives in
 * the language service, not the editor.
 *
 * Read the results against an interactivity budget:
 *   <16ms  fits within a frame on keystroke (fine)
 *   >100ms visible jank
 *   >1s    the JetBrains-class failure (see plan sources)
 * If the stress numbers stay above ~100ms after the Part C mitigations, that is
 * the evidence a language-service worker is the next lever.
 *
 * Run: pnpm --filter @another-graphql-ide/react bench
 */

// A near-empty query so completion offers every Query field: the widest, most
// schema-size-sensitive completion. Valid against both schemas.
const emptyQuery = 'query {\n  \n}'
const emptyPos = new Position(1, 2)

// An unknown top-level field forces the "did you mean" path to scan every field
// name on Query.
const invalidQuery = 'query {\n  thisFieldDefinitelyDoesNotExist\n}'

const cases = [
  {
    name: 'baseline (graphiql)',
    schema: graphiqlTestSchema,
    validQuery: 'query {\n  allFilms {\n    films {\n      title\n    }\n  }\n}',
    hoverPos: new Position(1, 4), // over "allFilms"
  },
  {
    name: 'stress (performance)',
    schema: performanceTestSchema,
    validQuery: 'query {\n  testType0 {\n    id\n  }\n}',
    hoverPos: new Position(1, 4), // over "testType0"
  },
] as const

describe('autocomplete — getAutocompleteSuggestions (Query fields)', () => {
  for (const c of cases) {
    bench(c.name, () => {
      getAutocompleteSuggestions(c.schema, emptyQuery, emptyPos)
    })
  }
})

describe('lint (valid) — getDiagnostics', () => {
  for (const c of cases) {
    bench(c.name, () => {
      getDiagnostics(c.validQuery, c.schema)
    })
  }
})

describe('lint (unknown field, did-you-mean) — getDiagnostics', () => {
  for (const c of cases) {
    bench(c.name, () => {
      getDiagnostics(invalidQuery, c.schema)
    })
  }
})

describe('hover — getHoverInformation', () => {
  for (const c of cases) {
    bench(c.name, () => {
      getHoverInformation(c.schema, c.validQuery, c.hoverPos)
    })
  }
})

// Document-size path (activeOperationField). Schema is null here, so this is
// independent of schema size — it scales with document size instead.
const oneOpDoc = makeLargeDocument(1)
const largeDoc = makeLargeDocument(300)

describe('operation facts — getOperationFacts (document-size path)', () => {
  bench('1 operation', () => {
    getOperationFacts(null, oneOpDoc)
  })
  bench('300 operations', () => {
    getOperationFacts(null, largeDoc)
  })
})

// activeOperationField runs on every doc change AND every caret move. A caret
// move can't change the operation ranges, only which one is active. Part C
// memoizes the ranges so a caret move takes the "reindex only" path below
// instead of a full reparse. These two benches quantify that per-caret-move
// saving on a large document.
const largeDocRanges = getOperationRanges(largeDoc)
const midCursor = Math.floor(largeDoc.length / 2)

describe('active operation on caret move (Part C: reparse vs reindex)', () => {
  bench('reparse (pre-Part C, per caret move)', () => {
    getOperationRanges(largeDoc)
  })
  bench('reindex only (post-Part C, per caret move)', () => {
    selectActiveOperationIndex(largeDocRanges, midCursor)
  })
})

// Schema attach: the connect() path in schema-slice runs buildClientSchema on
// every introspection result. Precompute the introspection (setup) and time the
// build step only.
const baselineIntrospection: IntrospectionQuery =
  introspectionFromSchema(graphiqlTestSchema)
const stressIntrospection: IntrospectionQuery =
  introspectionFromSchema(performanceTestSchema)

describe('schema attach — buildClientSchema (connect path)', () => {
  bench('baseline (graphiql)', () => {
    buildClientSchema(baselineIntrospection)
  })
  bench('stress (performance)', () => {
    buildClientSchema(stressIntrospection)
  })
})
