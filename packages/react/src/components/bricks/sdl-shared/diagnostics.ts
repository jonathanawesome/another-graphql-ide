import { themeContract } from '@another-graphql-ide/style'
import { foldedRanges, unfoldEffect } from '@codemirror/language'
import { linter, setDiagnostics, type Diagnostic } from '@codemirror/lint'
import {
  EditorState,
  Prec,
  StateEffect,
  StateField,
  type ChangeDesc,
  type Extension,
  type Text,
} from '@codemirror/state'
import {
  EditorView,
  ViewPlugin,
  logException,
  type ViewUpdate,
} from '@codemirror/view'

import { checkDelay } from './check-delay'
import { initMessageRows, setMessages, type SdlMessages } from './message-rows'

/** A problem in the text, and the range it underlines. */
export type EditorDiagnostic = {
  /** 1-based. */
  line: number
  severity: 'error' | 'warning'
  message: string
  from: number
  to: number
}

/** A problem as a check reports it. Its line comes from where it starts. */
export type Problem = Omit<EditorDiagnostic, 'line'>

export type Check = (text: string) => Problem[] | Promise<Problem[]>

/** Receives each check's result with the text it checked. */
export type Report = (
  diagnostics: readonly EditorDiagnostic[],
  text: string
) => void

/** What the check depends on changed, so run it again. */
export const recheck = StateEffect.define()

const setProblems = StateEffect.define<readonly Problem[]>()

/** Moves problems through an edit, dropping those whose text is gone. */
const mapProblems = (
  problems: readonly Problem[],
  changes: ChangeDesc
): readonly Problem[] =>
  problems
    .map(problem => ({
      ...problem,
      from: changes.mapPos(problem.from, 1),
      to: changes.mapPos(problem.to, -1),
    }))
    .filter(({ from, to }) => from < to)

const problemsField = StateField.define<readonly Problem[]>({
  create: () => [],
  update(problems, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setProblems)) return effect.value
    }
    return tr.docChanged && problems.length
      ? mapProblems(problems, tr.changes)
      : problems
  },
})

const messagesFor = (problems: readonly Problem[], doc: Text): SdlMessages =>
  problems.map(({ from, severity, message }) => ({
    line: doc.lineAt(from).number,
    tone: severity === 'error' ? 'danger' : 'warning',
    text: message,
  }))

// Message rows are by line number, so an edit above one has to move it.
const moveMessages = EditorState.transactionExtender.of(tr => {
  if (!tr.docChanged) return null
  const problems = tr.startState.field(problemsField, false)
  if (!problems?.length) return null
  return {
    effects: setMessages.of(
      messagesFor(mapProblems(problems, tr.changes), tr.newDoc)
    ),
  }
})

/** Keeps problems inside the document, and never empty unless it is. */
const clamp = (problem: Problem, length: number): Problem => {
  const from = Math.max(0, Math.min(problem.from, length - 1))
  const to = Math.min(Math.max(problem.to, from + 1), length)
  return { ...problem, from, to }
}

/** Opens folds that hide an error which was not there before. */
const unfoldNewErrors = (state: EditorState, problems: readonly Problem[]) => {
  const before = new Set(
    state.field(problemsField).map(({ from, message }) => `${from} ${message}`)
  )
  const effects: StateEffect<unknown>[] = []
  for (const { severity, from, message } of problems) {
    if (severity !== 'error' || before.has(`${from} ${message}`)) continue
    foldedRanges(state).between(from, from, (start, end) => {
      if (start < from && from < end) {
        effects.push(unfoldEffect.of({ from: start, to: end }))
      }
    })
  }
  return effects
}

const show = (view: EditorView, problems: readonly Problem[]) => {
  const { state } = view
  view.dispatch(
    {
      effects: [
        setProblems.of(problems),
        setMessages.of(messagesFor(problems, state.doc)),
        ...unfoldNewErrors(state, problems),
      ],
    },
    // Nothing to underline in an empty document.
    setDiagnostics(
      state,
      problems.filter(({ from, to }) => from < to)
    )
  )
}

const checker = (check: Check, report: Report) =>
  ViewPlugin.fromClass(
    class {
      private readonly view: EditorView
      private timer: ReturnType<typeof setTimeout> | undefined
      private cost = 0
      private destroyed = false
      private latest = 0

      constructor(view: EditorView) {
        this.view = view
        this.schedule(0)
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.schedule(checkDelay(this.cost))
        } else if (
          update.transactions.some(tr => tr.effects.some(e => e.is(recheck)))
        ) {
          this.schedule(0)
        }
      }

      destroy() {
        this.destroyed = true
        clearTimeout(this.timer)
      }

      private schedule(delay: number) {
        // Anything still running is for text or inputs that have changed.
        this.latest++
        clearTimeout(this.timer)
        this.timer = setTimeout(() => void this.run(), delay)
      }

      private async run() {
        const id = this.latest
        const { doc } = this.view.state
        const text = doc.toString()
        const start = performance.now()
        let problems: Problem[]
        try {
          const found = check(text)
          problems = Array.isArray(found) ? found : await found
        } catch (error) {
          // No report, so the host keeps treating this text as unchecked.
          logException(this.view.state, error)
          return
        }
        if (this.destroyed || id !== this.latest) return
        this.cost = performance.now() - start

        const shown = problems.map(problem => clamp(problem, doc.length))
        if (shown.length || this.view.state.field(problemsField).length) {
          show(this.view, shown)
        }
        report(
          shown.map(problem => ({
            line: doc.lineAt(problem.from).number,
            ...problem,
          })),
          text
        )
      }
    }
  )

const underline = (color: string) => ({
  // Replaces CodeMirror's background image, which cannot take a CSS variable.
  backgroundImage: 'none',
  paddingBottom: '0',
  textDecoration: `underline wavy ${color}`,
  textDecorationSkipInk: 'none',
})

const theme = EditorView.theme({
  '.cm-lintRange-error': underline(themeContract.status.danger),
  '.cm-lintRange-warning': underline(themeContract.status.warning),
})

// The message row already says it. An empty list would open an empty tooltip.
const noTooltip = () => null as unknown as Diagnostic[]

/**
 * Checks the text on mount, after a pause in typing and on `recheck`. Shows
 * each problem as an underline and a message row, and reports them.
 */
export const diagnostics = (check: Check, report: Report): Extension => [
  problemsField,
  moveMessages,
  initMessageRows(),
  linter(null, { tooltipFilter: noTooltip }),
  Prec.high(theme),
  checker(check, report),
]
