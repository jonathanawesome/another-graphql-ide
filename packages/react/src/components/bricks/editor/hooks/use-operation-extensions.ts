import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { useEffect, useState } from 'react'

import { operationExtensions } from '../codemirror/operation-extensions'

export type UseOperationExtensionsParams = {
  /** Called with the active operation name (or undefined) when it changes. */
  onActiveOperationChange?: (name: string | undefined) => void
  /** Called with the caret offset when it moves. */
  onSelectionChange?: (offset: number) => void
  /**
   * A one-shot request to move the caret or select a range, applied once per
   * `nonce`, e.g. to select a placeholder after a schema tree insert.
   */
  pendingSelection?: { anchor: number; head: number; nonce: number }
}

/** Latest callbacks and the live view, held outside React's render data. */
class Handlers {
  view: EditorView | null = null
  onActive?: (name: string | undefined) => void
  onSelection?: (offset: number) => void

  update(params: UseOperationExtensionsParams) {
    this.onActive = params.onActiveOperationChange
    this.onSelection = params.onSelectionChange
  }
}

const createHandlers = (params: UseOperationExtensionsParams) => {
  const handlers = new Handlers()
  // Seeded now because the view reports its starting state on mount.
  handlers.update(params)

  const extensions = operationExtensions({
    onActiveOperationChange: name => handlers.onActive?.(name),
    onSelectionChange: offset => handlers.onSelection?.(offset),
    onView: view => {
      handlers.view = view
    },
  })

  return { handlers, extensions }
}

/**
 * Extensions that turn the basic Editor into an operation editor. Pass the
 * result to Editor's `extensions` prop. The value is stable across renders.
 */
export const useOperationExtensions = (
  params: UseOperationExtensionsParams
): Extension => {
  // Built once, so the extensions keep their identity across renders.
  const [{ handlers, extensions }] = useState(() => createHandlers(params))

  useEffect(() => {
    handlers.update(params)
  })

  const { pendingSelection } = params

  // Runs after Editor's own effects (a child's effects flush first), so the
  // document already holds any value this render pushed into it.
  useEffect(() => {
    const view = handlers.view
    if (!view || !pendingSelection) return
    const max = view.state.doc.length
    view.dispatch({
      selection: {
        anchor: Math.min(pendingSelection.anchor, max),
        head: Math.min(pendingSelection.head, max),
      },
    })
    view.focus()
    // Keyed on nonce so each request applies once, even to a repeated range.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the whole object would re-apply the same selection
  }, [pendingSelection?.nonce])

  return extensions
}
