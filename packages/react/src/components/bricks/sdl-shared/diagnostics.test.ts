import { foldEffect, foldedRanges } from '@codemirror/language'
import { diagnosticCount } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { checkDelay } from './check-delay'
import { diagnostics, recheck, type Check } from './diagnostics'
import { messageRows } from './message-rows'

/** Every `bad` is an error, and every `odd` a warning. */
const findWords: Check = text =>
  [...text.matchAll(/bad|odd/g)].map(match => ({
    severity: match[0] === 'bad' ? 'error' : 'warning',
    message: `found ${match[0]}`,
    from: match.index,
    to: match.index + 3,
  }))

let view: EditorView
const report = vi.fn()

const mount = (doc: string, check: Check = findWords) => {
  view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [basicSetup, diagnostics(check, report)],
    }),
    parent: document.body,
  })
}

const rowLines = () =>
  view.state.field(messageRows).messages.map(message => message.line)
const settle = () => vi.advanceTimersByTimeAsync(2000)

beforeEach(() => {
  vi.useFakeTimers()
  report.mockClear()
})

afterEach(() => {
  view.destroy()
  vi.useRealTimers()
})

describe('diagnostics', () => {
  it('checks on mount and reports the text with its problems', async () => {
    mount('a\nbad\nodd')
    await settle()

    expect(report).toHaveBeenCalledExactlyOnceWith(
      [
        { line: 2, severity: 'error', message: 'found bad', from: 2, to: 5 },
        { line: 3, severity: 'warning', message: 'found odd', from: 6, to: 9 },
      ],
      'a\nbad\nodd'
    )
    expect(diagnosticCount(view.state)).toBe(2)
  })

  it('reports clean text too', async () => {
    mount('fine')
    await settle()

    expect(report).toHaveBeenCalledWith([], 'fine')
  })

  it('shows rows that are not in the text', async () => {
    mount('bad')
    await settle()

    expect(view.dom.querySelector('.cm-sdl-message-danger')).not.toBeNull()
    expect(view.dom.querySelector('.cm-lintRange-error')?.textContent).toBe(
      'bad'
    )
    expect(view.state.doc.toString()).toBe('bad')
  })

  it('waits for a pause in typing, then reports once', async () => {
    mount('')
    await settle()
    report.mockClear()

    for (const letter of 'bad') {
      view.dispatch({
        changes: { from: view.state.doc.length, insert: letter },
      })
      await vi.advanceTimersByTimeAsync(100)
    }
    expect(report).not.toHaveBeenCalled()
    await settle()

    expect(report).toHaveBeenCalledOnce()
    expect(report.mock.lastCall?.[1]).toBe('bad')
  })

  it('moves rows with their text before the next check', async () => {
    mount('a\nx bad')
    await settle()

    view.dispatch({ changes: { from: 0, insert: 'new\n' } })
    expect(rowLines()).toEqual([3])
    // Splitting the line takes the row along with its word.
    view.dispatch({ changes: { from: 7, insert: '\n' } })
    expect(rowLines()).toEqual([4])
  })

  it('drops a row as soon as its text is deleted', async () => {
    mount('bad\nodd')
    await settle()

    view.dispatch({ changes: { from: 0, to: 4 } })

    expect(rowLines()).toEqual([1])
    expect(view.state.field(messageRows).messages[0]?.text).toBe('found odd')
  })

  it('clears everything once fixed', async () => {
    mount('bad')
    await settle()
    view.dispatch({ changes: { from: 0, to: 3, insert: 'good' } })
    await settle()

    expect(report.mock.lastCall).toEqual([[], 'good'])
    expect(rowLines()).toEqual([])
    expect(diagnosticCount(view.state)).toBe(0)
  })

  it('ignores a slow check once the text has moved on', async () => {
    const resolvers: (() => void)[] = []
    mount('bad', text => {
      const found = findWords(text)
      return new Promise(resolve => {
        resolvers.push(() => resolve(found))
      })
    })
    await settle()
    view.dispatch({ changes: { from: 0, insert: 'odd ' } })
    await settle()

    resolvers[0]?.()
    await settle()
    expect(report).not.toHaveBeenCalled()

    resolvers[1]?.()
    await settle()
    expect(report).toHaveBeenCalledOnce()
    expect(report.mock.lastCall?.[1]).toBe('odd bad')
  })

  it('checks again when asked', async () => {
    let word = 'bad'
    mount('bad', () => [{ severity: 'error', message: word, from: 0, to: 3 }])
    await settle()
    word = 'changed'
    view.dispatch({ effects: recheck.of(null) })
    await settle()

    expect(report).toHaveBeenCalledTimes(2)
    expect(report.mock.lastCall?.[0]).toMatchObject([{ message: 'changed' }])
  })

  it('does not report when a check fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mount('bad', () => Promise.reject(new Error('broken')))
    await settle()

    expect(report).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })

  it('does not report after the view is gone', async () => {
    mount('bad')
    view.destroy()
    await settle()

    expect(report).not.toHaveBeenCalled()
  })

  it('keeps a problem at the end of the text inside it', async () => {
    mount('ab', () => [{ severity: 'error', message: 'end', from: 2, to: 2 }])
    await settle()

    expect(report.mock.lastCall?.[0]).toMatchObject([{ from: 1, to: 2 }])
  })

  it('reports a problem in an empty document, with no underline', async () => {
    mount('', () => [{ severity: 'error', message: 'x', from: 0, to: 0 }])
    await settle()

    expect(report).toHaveBeenCalledExactlyOnceWith(
      [{ line: 1, severity: 'error', message: 'x', from: 0, to: 0 }],
      ''
    )
    expect(rowLines()).toEqual([1])
    expect(diagnosticCount(view.state)).toBe(0)

    view.dispatch({ changes: { from: 0, insert: 'a' } })
    expect(rowLines()).toEqual([])
  })

  const folded = () => {
    let count = 0
    foldedRanges(view.state).between(0, view.state.doc.length, () => {
      count++
    })
    return count
  }

  it('opens a fold over a new error, but lets it be folded again', async () => {
    mount('{\nok\n}\nend')
    await settle()
    const fold = foldEffect.of({ from: 1, to: 5 })
    view.dispatch({ effects: fold })
    view.dispatch({ changes: { from: 2, to: 4, insert: 'bad' } })
    view.dispatch({ effects: foldEffect.of({ from: 1, to: 6 }) })
    await settle()
    expect(folded()).toBe(0)

    view.dispatch({ effects: foldEffect.of({ from: 1, to: 6 }) })
    view.dispatch({ changes: { from: view.state.doc.length, insert: '!' } })
    await settle()
    expect(folded()).toBe(1)
  })

  it('leaves a fold over a warning closed', async () => {
    mount('{\nodd\n}')
    view.dispatch({ effects: foldEffect.of({ from: 1, to: 6 }) })
    await settle()

    expect(folded()).toBe(1)
  })
})

describe('checkDelay', () => {
  it('grows with the cost of a check, within limits', () => {
    expect([0, 100, 5000].map(checkDelay)).toEqual([150, 300, 1500])
  })
})
