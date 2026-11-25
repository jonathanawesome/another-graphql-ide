import { setSearchQuery } from '@codemirror/search'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { Icon } from '../../primitives/icon/icon'
import { IconButton } from '../../primitives/icon-button/icon-button'

import { findMatches, queryFor, type FindStore } from './find'
import { findBarStyles as styles } from './find-bar.css'

// Above this many characters, counting waits for a pause in typing.
const LARGE_DOC = 200_000
const COUNT_DELAY = 150

/** Index of the first match starting at or after `from`. */
const lowerBound = (matches: number[], from: number) => {
  let low = 0
  let high = matches.length
  while (low < high) {
    const middle = (low + high) >> 1
    if ((matches[middle] ?? 0) < from) low = middle + 1
    else high = middle
  }
  return low
}

/** Index of the match the selection covers exactly, or -1. */
const currentMatch = (
  matches: number[],
  selection: { from: number; to: number },
  length: number
) => {
  if (selection.to - selection.from !== length) return -1
  const index = lowerBound(matches, selection.from)
  return matches[index] === selection.from ? index : -1
}

/**
 * The match to move to: the next or previous one from the current match,
 * or, off a match, the first one after the selection. Wraps around.
 */
const stepTo = (
  matches: number[],
  selection: { from: number; to: number },
  length: number,
  direction: 1 | -1 | 0
) => {
  const total = matches.length
  if (total === 0) return undefined
  const current = currentMatch(matches, selection, length)
  if (current !== -1) return matches[(current + direction + total) % total]
  const after = lowerBound(matches, selection.from)
  return direction === -1
    ? matches[(after - 1 + total) % total]
    : matches[after % total]
}

// Moves between matches without CodeMirror's findNext, which selects the
// field's text and so lets the next keystroke replace the query.
const selectMatch = (view: EditorView, start: number, length: number) =>
  view.dispatch({
    selection: { anchor: start, head: start + length },
    effects: EditorView.scrollIntoView(start, { y: 'center' }),
    userEvent: 'select.search',
  })

type ColumnSize = { width: number; scrollbar: number }

/**
 * Width of the annotation column plus the scrollbar beside it, so the
 * heading sits over the column and its label over the values.
 */
const useColumnSize = (
  view: EditorView,
  shown: boolean,
  collapsed: boolean
) => {
  const [size, setSize] = useState<ColumnSize>()
  useEffect(() => {
    // CodeMirror adds the element with the first column, then keeps it.
    const column = shown
      ? view.dom.querySelector<HTMLElement>('.cm-gutters-after')
      : null
    if (!column || typeof ResizeObserver === 'undefined') return
    const scroller = view.scrollDOM
    // Fires once on observe, then on every resize. The scroller's content
    // box shrinks when a scrollbar appears.
    const observer = new ResizeObserver(() => {
      const scrollbar = scroller.offsetWidth - scroller.clientWidth
      setSize(
        column.clientWidth > 0
          ? { width: column.offsetWidth + scrollbar, scrollbar }
          : undefined
      )
    })
    observer.observe(column)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [view, shown, collapsed])
  return shown ? size : undefined
}

export type FindBarProps = {
  view: EditorView
  store: FindStore
  /** Heading over the annotation column. */
  label?: string
  /** The viewer has annotation data, so the column can show. */
  withColumn: boolean
  collapsed?: boolean
  onToggleColumn?: () => void
}

/**
 * The find bar over SDL: a search field with a match count, previous and
 * next, and the annotation column's heading. The query lives in CodeMirror's
 * search state, so Cmd/Ctrl-F and the match highlights stay in step with it.
 */
export const FindBar = ({
  view,
  store,
  label,
  withColumn,
  collapsed = false,
  onToggleColumn,
}: FindBarProps) => {
  const { query, from, to, doc } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  )
  const [result, setResult] = useState<{
    query: string
    doc: number
    matches: number[]
  }>()
  const jumpedFor = useRef('')
  const columnSize = useColumnSize(view, withColumn, collapsed)

  useEffect(() => {
    if (!query) {
      jumpedFor.current = ''
      return
    }
    const delay = view.state.doc.length > LARGE_DOC ? COUNT_DELAY : 0
    const timer = setTimeout(() => {
      const matches = findMatches(view.state, query)
      setResult({ query, doc, matches })
      // A new query moves to its first match from the selection.
      if (jumpedFor.current !== query) {
        jumpedFor.current = query
        const start = stepTo(
          matches,
          view.state.selection.main,
          query.length,
          0
        )
        if (start !== undefined) selectMatch(view, start, query.length)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [view, query, doc])

  const counted = result?.query === query && result.doc === doc
  const matches = counted ? result.matches : undefined
  const total = matches?.length ?? 0
  const current = matches
    ? currentMatch(matches, { from, to }, query.length)
    : -1
  const count = !matches
    ? ''
    : total === 0
      ? 'No matches'
      : current === -1
        ? `${total} matches`
        : `${current + 1} of ${total}`

  const setQuery = (text: string) =>
    view.dispatch({ effects: setSearchQuery.of(queryFor(text)) })

  const step = (direction: 1 | -1) => {
    // Before the count lands on a large document, count now.
    const list = matches ?? findMatches(view.state, query)
    const start = stepTo(
      list,
      view.state.selection.main,
      query.length,
      direction
    )
    if (start !== undefined) selectMatch(view, start, query.length)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (query) step(event.shiftKey ? -1 : 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (query) setQuery('')
      else view.focus()
    }
  }

  const navigation = total === 0 ? 'disabled' : undefined

  return (
    <div className={styles.bar}>
      <div className={styles.field}>
        <Icon name="Search" size="small" />
        <input
          className={styles.input}
          // CodeMirror's Cmd/Ctrl-F focuses the panel element with this attribute.
          // eslint-disable-next-line react/no-unknown-property -- see above
          main-field="true"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search this schema"
          aria-label="Search this schema"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <>
            <span className={styles.count} aria-live="polite">
              {count}
            </span>
            <IconButton
              ghost
              size="mini"
              name="X"
              label="Clear search"
              action={() => setQuery('')}
            />
          </>
        )}
      </div>
      {query && (
        <>
          <IconButton
            ghost
            size="mini"
            name="Chevron"
            rotate="180"
            label="Previous match"
            state={navigation}
            action={() => step(-1)}
          />
          <IconButton
            ghost
            size="mini"
            name="Chevron"
            label="Next match"
            state={navigation}
            action={() => step(1)}
          />
        </>
      )}
      {(label !== undefined || withColumn) && (
        <div
          className={styles.heading}
          style={
            columnSize && {
              minWidth: columnSize.width,
              paddingInlineEnd: 14 + columnSize.scrollbar,
            }
          }
        >
          <span className={styles.divider} />
          {withColumn && onToggleColumn && (
            <IconButton
              ghost
              size="mini"
              name="Chevron"
              rotate={collapsed ? '180' : undefined}
              label={
                collapsed
                  ? `Show ${label ?? 'annotation'} column`
                  : `Hide ${label ?? 'annotation'} column`
              }
              action={onToggleColumn}
            />
          )}
          {!collapsed && <span className={styles.label}>{label}</span>}
        </div>
      )}
    </div>
  )
}
