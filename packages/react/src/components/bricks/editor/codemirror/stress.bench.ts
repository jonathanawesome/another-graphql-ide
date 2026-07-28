import { bench, describe } from 'vitest'

import { stressMeasurementGroups } from './stress-measurements'

/**
 * Headless benchmark of the main-thread graphql-language-service hot paths. The
 * measurements themselves live in stress-measurements.ts, shared with the
 * in-browser benchmark panel so the two never drift; this file only wires them
 * into Vitest's bench runner.
 *
 * Read the results against an interactivity budget (see stress-measurements.ts):
 * <16ms fits a keystroke frame, >100ms is visible jank, >1s is a failure.
 *
 * Run: pnpm --filter @another-graphql-ide/react bench
 */
for (const g of stressMeasurementGroups) {
  describe(g.group, () => {
    for (const c of g.cases) {
      bench(c.variant, c.run)
    }
  })
}
