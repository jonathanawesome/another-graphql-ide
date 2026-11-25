import { foldedRanges } from '@codemirror/language'
import {
  StateEffect,
  StateField,
  type EditorState,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  GutterMarker,
  ViewPlugin,
  WidgetType,
  gutterWidgetClass,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'

/** Text to show under a line of the document. */
export type SdlMessage = {
  /** 1-based. A line the document does not have is ignored. */
  line: number
  tone: 'warning' | 'danger'
  text: string
  /** A short identifier after the text, such as a rule name. */
  code?: string
}

export type SdlMessages = readonly SdlMessage[]

export const NO_MESSAGES: SdlMessages = []

/** Height of a message on one line. Longer ones wrap. */
export const MESSAGE_ROW_HEIGHT = 30

// Past this, scrolling reads better than wrapping every word.
const MIN_MESSAGE_WIDTH = 240

const TONE_LABEL = { warning: 'Warning', danger: 'Error' }

/** The host's messages changed. */
export const setMessages = StateEffect.define<SdlMessages>()

class MessageRow extends WidgetType {
  readonly message: SdlMessage

  constructor(message: SdlMessage) {
    super()
    this.message = message
  }

  override eq({ message }: MessageRow) {
    return (
      message.tone === this.message.tone &&
      message.text === this.message.text &&
      message.code === this.message.code
    )
  }

  override get estimatedHeight() {
    return MESSAGE_ROW_HEIGHT
  }

  override toDOM() {
    const { tone, text, code } = this.message
    const row = document.createElement('div')
    row.className = `cm-sdl-message cm-sdl-message-${tone}`
    const dot = row.appendChild(document.createElement('span'))
    dot.className = 'cm-sdl-message-dot'
    dot.role = 'img'
    dot.ariaLabel = TONE_LABEL[tone]
    const body = row.appendChild(document.createElement('span'))
    body.textContent = text
    if (code) {
      const rule = body.appendChild(document.createElement('span'))
      rule.className = 'cm-sdl-message-code'
      rule.textContent = code
    }
    return row
  }
}

class MessageGutter extends GutterMarker {
  override readonly elementClass: string

  constructor(tone: SdlMessage['tone']) {
    super()
    this.elementClass = `cm-sdl-message-${tone}`
  }
}

const gutterMarker = {
  warning: new MessageGutter('warning'),
  danger: new MessageGutter('danger'),
}

/** The end of a line's row, which is where its fold ends while folded. */
const rowEnd = (state: EditorState, line: number) => {
  let end = state.doc.line(line).to
  foldedRanges(state).between(end, end, (from, to) => {
    if (from === end) {
      end = state.doc.lineAt(to).to
      return false
    }
    return undefined
  })
  return end
}

const build = (state: EditorState, messages: SdlMessages): DecorationSet =>
  Decoration.set(
    messages
      .filter(({ line }) => line >= 1 && line <= state.doc.lines)
      .sort((a, b) => a.line - b.line)
      .map(message =>
        Decoration.widget({
          widget: new MessageRow(message),
          block: true,
          side: 1,
        }).range(rowEnd(state, message.line))
      ),
    true
  )

type State = { messages: SdlMessages; rows: DecorationSet }

/** The host's messages, each a row under its line and across the gutters. */
export const messageRows = StateField.define<State>({
  create: () => ({ messages: NO_MESSAGES, rows: Decoration.none }),
  update(value, tr) {
    let { messages } = value
    for (const effect of tr.effects) {
      if (effect.is(setMessages)) messages = effect.value
    }
    if (
      messages === value.messages &&
      !tr.docChanged &&
      foldedRanges(tr.state) === foldedRanges(tr.startState)
    ) {
      return value
    }
    return { messages, rows: build(tr.state, messages) }
  },
  provide: field => [
    EditorView.decorations.from(field, value => value.rows),
    gutterWidgetClass.of((_, widget) =>
      widget instanceof MessageRow ? gutterMarker[widget.message.tone] : null
    ),
  ],
})

/** Width of the code in view, between the gutters. */
export const MESSAGE_WIDTH_VAR = '--sdl-message-width'

// Messages wrap in view, even where the code is wider and scrolls.
const messageWidth = ViewPlugin.fromClass(
  class {
    private width = 0

    constructor(view: EditorView) {
      this.measure(view)
    }

    update(update: ViewUpdate) {
      if (update.geometryChanged) this.measure(update.view)
    }

    private measure(view: EditorView) {
      view.requestMeasure({
        key: this,
        read: ({ scrollDOM }) => {
          let width = scrollDOM.clientWidth
          for (const gutters of scrollDOM.querySelectorAll<HTMLElement>(
            ':scope > .cm-gutters'
          )) {
            width -= gutters.offsetWidth
          }
          return Math.max(width, MIN_MESSAGE_WIDTH)
        },
        write: (width, { scrollDOM }) => {
          if (width === this.width) return
          this.width = width
          scrollDOM.style.setProperty(MESSAGE_WIDTH_VAR, `${width}px`)
          // Rows may now wrap differently, so have their heights read again.
          view.requestMeasure({ read: () => undefined })
        },
      })
    }
  }
)

/** Starts from the host's first messages. */
export const initMessageRows = (
  messages: SdlMessages = NO_MESSAGES
): Extension => [
  messageRows.init(state => ({ messages, rows: build(state, messages) })),
  messageWidth,
]
