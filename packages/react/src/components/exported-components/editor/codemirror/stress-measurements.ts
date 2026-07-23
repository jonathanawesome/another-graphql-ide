import {
  graphiqlTestSchema,
  performanceTestSchema,
} from '@another-graphql-ide/shared'
import {
  buildClientSchema,
  introspectionFromSchema,
  type GraphQLSchema,
  type IntrospectionQuery,
} from 'graphql'
import {
  getAutocompleteSuggestions,
  getDiagnostics,
  getHoverInformation,
  getOperationFacts,
  Position,
} from 'graphql-language-service'

import { makeLargeDocument } from './__fixtures__/large-doc'
import {
  getOperationRanges,
  selectActiveOperationIndex,
} from './active-operation'

/**
 * Shared definitions of the main-thread graphql-language-service work that
 * cm6-graphql (completion + lint) and graphqlHover wrap. cm6-graphql runs these
 * on the main thread, unlike monaco-graphql's web worker, so these are the crux
 * of whether the CodeMirror migration holds up on large schemas.
 *
 * This is the single source of truth consumed by both the headless Vitest suite
 * (stress.bench.ts) and the in-browser benchmark panel, so the two can never
 * drift. Each schema-sensitive path runs against a baseline schema and the
 * ~11,800-type stress schema, so the gap shows the cost scales with schema size
 * and lives in the language service, not the editor.
 *
 * Interactivity budget for reading the numbers:
 *   <16ms  fits within a frame on keystroke (fine)
 *   >100ms visible jank
 *   >1s    the JetBrains-class failure
 */

export type StressCase = { variant: string; run: () => void }
export type StressGroup = { group: string; note?: string; cases: StressCase[] }

// A near-empty query so completion offers every Query field: the widest, most
// schema-size-sensitive completion. Valid against both schemas.
const emptyQuery = 'query {\n  \n}'
const emptyPos = new Position(1, 2)

// An unknown top-level field forces the "did you mean" path to scan every field
// name on Query.
const invalidQuery = 'query {\n  thisFieldDefinitelyDoesNotExist\n}'

const schemaCases = [
  {
    variant: 'baseline (small)',
    schema: graphiqlTestSchema,
    validQuery: 'query {\n  allFilms {\n    films {\n      title\n    }\n  }\n}',
    hoverPos: new Position(1, 4), // over "allFilms"
  },
  {
    variant: 'stress (performance)',
    schema: performanceTestSchema,
    validQuery: 'query {\n  testType0 {\n    id\n  }\n}',
    hoverPos: new Position(1, 4), // over "testType0"
  },
] as const

// Document-size path (activeOperationField). Schema is null here, so this scales
// with document size, not schema size.
const oneOpDoc = makeLargeDocument(1)
const largeDoc = makeLargeDocument(300)
const largeDocRanges = getOperationRanges(largeDoc)
const midCursor = Math.floor(largeDoc.length / 2)

// buildClientSchema needs an introspection result. Producing it is setup, not
// the thing we measure, so cache it lazily: the cost lands in the runner's
// warmup on first use, not at module import (which would slow opening the panel).
const introspectionCache = new Map<GraphQLSchema, IntrospectionQuery>()
const introspectionOf = (schema: GraphQLSchema): IntrospectionQuery => {
  let cached = introspectionCache.get(schema)
  if (!cached) {
    cached = introspectionFromSchema(schema)
    introspectionCache.set(schema, cached)
  }
  return cached
}

export const stressMeasurementGroups: StressGroup[] = [
  {
    group: 'autocomplete',
    note: 'completion over every Query field',
    cases: schemaCases.map(c => ({
      variant: c.variant,
      run: () => {
        getAutocompleteSuggestions(c.schema, emptyQuery, emptyPos)
      },
    })),
  },
  {
    group: 'lint (valid)',
    cases: schemaCases.map(c => ({
      variant: c.variant,
      run: () => {
        getDiagnostics(c.validQuery, c.schema)
      },
    })),
  },
  {
    group: 'lint (unknown field)',
    note: 'did-you-mean scans all field names',
    cases: schemaCases.map(c => ({
      variant: c.variant,
      run: () => {
        getDiagnostics(invalidQuery, c.schema)
      },
    })),
  },
  {
    group: 'hover',
    cases: schemaCases.map(c => ({
      variant: c.variant,
      run: () => {
        getHoverInformation(c.schema, c.validQuery, c.hoverPos)
      },
    })),
  },
  {
    group: 'operation facts',
    note: 'document-size path, runs on every keystroke',
    cases: [
      {
        variant: '1 operation',
        run: () => {
          getOperationFacts(null, oneOpDoc)
        },
      },
      {
        variant: '300 operations',
        run: () => {
          getOperationFacts(null, largeDoc)
        },
      },
    ],
  },
  {
    group: 'active operation (caret move)',
    note: 'Part C: full reparse vs cached reindex',
    cases: [
      {
        variant: 'reparse (pre-Part C)',
        run: () => {
          getOperationRanges(largeDoc)
        },
      },
      {
        variant: 'reindex (post-Part C)',
        run: () => {
          selectActiveOperationIndex(largeDocRanges, midCursor)
        },
      },
    ],
  },
  {
    group: 'schema attach',
    note: 'one-time buildClientSchema on connect',
    cases: schemaCases.map(c => ({
      variant: c.variant,
      run: () => {
        buildClientSchema(introspectionOf(c.schema))
      },
    })),
  },
]

/** Timing summary for one measurement, all times in milliseconds. */
export type StressStat = {
  mean: number
  p75: number
  p99: number
  hz: number
  samples: number
}

type RunOptions = {
  warmupMs?: number
  budgetMs?: number
  minSamples?: number
  maxSamples?: number
}

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.floor(p * sorted.length))
  return sorted[index] ?? 0
}

/**
 * Run one measurement in the browser and report timing stats. Warms up for a
 * fixed window, then samples for a time budget (not a fixed iteration count) so
 * cheap cases stay well-sampled while expensive ones (buildClientSchema) are
 * bounded. Blocks the main thread for the budget window by design: that stall is
 * exactly the cost being measured.
 */
export const runStressCase = (
  run: () => void,
  options: RunOptions = {}
): StressStat => {
  const {
    warmupMs = 25,
    budgetMs = 200,
    minSamples = 8,
    maxSamples = 100_000,
  } = options

  const warmEnd = performance.now() + warmupMs
  while (performance.now() < warmEnd) run()

  const times: number[] = []
  const end = performance.now() + budgetMs
  while (
    (performance.now() < end || times.length < minSamples) &&
    times.length < maxSamples
  ) {
    const start = performance.now()
    run()
    times.push(performance.now() - start)
  }

  times.sort((a, b) => a - b)
  const mean = times.reduce((sum, t) => sum + t, 0) / times.length
  return {
    mean,
    p75: percentile(times, 0.75),
    p99: percentile(times, 0.99),
    hz: mean > 0 ? 1000 / mean : Infinity,
    samples: times.length,
  }
}
