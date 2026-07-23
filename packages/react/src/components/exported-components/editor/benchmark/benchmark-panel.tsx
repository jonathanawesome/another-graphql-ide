import { useState } from 'react'

import { Button } from '../../../ui-components/button/button'
import { Pill } from '../../../ui-components/pill/pill'
import {
  runStressCase,
  stressMeasurementGroups,
  type StressStat,
} from '../codemirror/stress-measurements'

import * as styles from './benchmark-panel.css'

type ResultRow = StressStat & {
  group: string
  variant: string
  // schema attach is a one-time connect cost, not a per-keystroke path, so it is
  // exempt from the interactivity budget.
  perKeystroke: boolean
}

const TOTAL_CASES = stressMeasurementGroups.reduce(
  (n, g) => n + g.cases.length,
  0
)

const formatMs = (ms: number): string =>
  ms < 0.01 ? ms.toFixed(4) : ms < 1 ? ms.toFixed(3) : ms.toFixed(2)

const formatHz = (hz: number): string =>
  Number.isFinite(hz) ? Math.round(hz).toLocaleString() : '∞'

const budgetFor = (row: ResultRow): { cls: string; label: string } => {
  if (!row.perKeystroke) return { cls: styles.dotOnce, label: 'once' }
  if (row.mean < 16) return { cls: styles.dotOk, label: 'ok' }
  if (row.mean < 100) return { cls: styles.dotJank, label: 'jank' }
  return { cls: styles.dotBlock, label: 'blocking' }
}

/**
 * In-preview benchmark. Runs the shared stress measurements on the real browser
 * main thread and renders the timings. Runs sequentially, yielding a frame
 * between cases so the progress label paints; each case then blocks the main
 * thread for its sampling window, which is the cost being demonstrated.
 */
export const BenchmarkPanel = () => {
  const [results, setResults] = useState<ResultRow[]>([])
  const [running, setRunning] = useState(false)
  const [current, setCurrent] = useState<string>()

  const run = async () => {
    setRunning(true)
    setResults([])
    const acc: ResultRow[] = []
    for (const group of stressMeasurementGroups) {
      const perKeystroke = group.group !== 'schema attach'
      for (const testCase of group.cases) {
        setCurrent(`${group.group} · ${testCase.variant}`)
        // Yield a frame so the label and progress bar paint before the next
        // measurement blocks the main thread.
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => resolve())
        })
        const stat = runStressCase(testCase.run)
        acc.push({
          group: group.group,
          variant: testCase.variant,
          perKeystroke,
          ...stat,
        })
        setResults([...acc])
      }
    }
    setCurrent(undefined)
    setRunning(false)
  }

  const status = running
    ? (current ?? 'starting')
    : results.length > 0
      ? `done · ${results.length} runs`
      : 'idle'

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Button
          text={running ? 'Running…' : 'Run benchmark'}
          label="Run benchmark"
          action={() => void run()}
          state={running ? 'disabled' : undefined}
          withLeftIcon="Play"
        />
        <Pill text={status} />
      </div>

      {running && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(results.length / TOTAL_CASES) * 100}%` }}
          />
        </div>
      )}

      {results.length === 0 && !running && (
        <p className={styles.intro}>
          Times the main-thread graphql-language-service work (completion, lint,
          hover, document parsing, schema attach) against the baseline schema
          and the 11,800-type stress schema. Running blocks this tab briefly per
          measurement: that stall is the cost you would feel while typing.
        </p>
      )}

      {results.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>group</th>
                <th className={styles.th}>variant</th>
                <th className={`${styles.th} ${styles.num}`}>mean (ms)</th>
                <th className={`${styles.th} ${styles.num}`}>p75</th>
                <th className={`${styles.th} ${styles.num}`}>p99</th>
                <th className={`${styles.th} ${styles.num}`}>hz</th>
                <th className={`${styles.th} ${styles.num}`}>samples</th>
                <th className={styles.th}>budget</th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => {
                const b = budgetFor(row)
                return (
                  <tr key={`${row.group}-${row.variant}`}>
                    <td className={`${styles.td} ${styles.groupCell}`}>
                      {row.group}
                    </td>
                    <td className={`${styles.td} ${styles.variantCell}`}>
                      {row.variant}
                    </td>
                    <td className={`${styles.td} ${styles.num}`}>
                      {formatMs(row.mean)}
                    </td>
                    <td className={`${styles.td} ${styles.num}`}>
                      {formatMs(row.p75)}
                    </td>
                    <td className={`${styles.td} ${styles.num}`}>
                      {formatMs(row.p99)}
                    </td>
                    <td className={`${styles.td} ${styles.num}`}>
                      {formatHz(row.hz)}
                    </td>
                    <td className={`${styles.td} ${styles.num}`}>
                      {row.samples.toLocaleString()}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.budget}>
                        <span className={b.cls} />
                        {b.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
