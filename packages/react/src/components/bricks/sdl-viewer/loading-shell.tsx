import { themeContract } from '@another-graphql-ide/style'

import { Icon } from '../../primitives/icon/icon'

import { findBarStyles } from './find-bar.css'
import { skeletonStyles as styles } from './sdl-viewer.css'

// One block per type: its line, some fields, the closing brace, a blank line.
// Code widths in percent; a field row also has an annotation placeholder.
const BLOCKS = [
  [38, 22, 30, 18, 26],
  [44, 34, 52, 20],
  [30, 40, 26, 46, 24, 32],
  [36, 28, 38],
]

type Row = { key: string; width?: number; indent?: boolean; field?: boolean }

const ROWS: Row[] = BLOCKS.flatMap((block, b) => {
  const [head = 30, ...fields] = block
  return [
    { key: `${b}-head`, width: head },
    ...fields.map((width, f) => ({
      key: `${b}-${f}`,
      width,
      indent: true,
      field: true,
    })),
    { key: `${b}-close`, width: 2 },
    { key: `${b}-blank` },
  ]
})

/** Placeholder lines and a disabled find bar while the schema loads. */
export const LoadingShell = ({
  label,
  withColumn,
}: {
  label?: string
  withColumn: boolean
}) => (
  <>
    <div
      className={findBarStyles.bar}
      style={{ borderBottom: `1px solid ${themeContract.border.subtle}` }}
    >
      <div className={findBarStyles.field}>
        <Icon name="Search" size="small" />
        <input
          className={findBarStyles.input}
          placeholder="Search this schema"
          aria-label="Search this schema"
          disabled
        />
      </div>
      {label !== undefined && (
        <div className={findBarStyles.heading}>
          <span className={findBarStyles.divider} />
          {label}
        </div>
      )}
    </div>
    <div className={styles.lines} aria-hidden>
      {ROWS.map(row => (
        <div key={row.key} className={styles.row}>
          <span className={styles.number} />
          {row.width !== undefined && (
            <span
              className={styles.code}
              style={{
                width: `${row.width}%`,
                marginInlineStart: row.indent ? 16 : 0,
              }}
            />
          )}
          {row.field && withColumn && (
            <span className={styles.annotation}>
              <span className={styles.track} />
              <span className={styles.value} />
            </span>
          )}
        </div>
      ))}
    </div>
  </>
)
