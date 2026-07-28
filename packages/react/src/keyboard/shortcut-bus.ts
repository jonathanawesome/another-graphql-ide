import { hasModifier, matchesCombo } from './match'
import { SHORTCUTS, type ShortcutId } from './shortcuts'

/**
 * One listener for the whole page, however many bricks are mounted.
 *
 * This library has no app shell to hang a global listener on, so each brick
 * opts in with `useShortcut`. Registrations stack per shortcut and only the
 * newest fires, which is what a modal or overlay will want later.
 *
 * The bus is page-global while stores are now per-provider, so with two
 * providers on a page a shortcut reaches whichever brick mounted last. Scoping
 * registrations to a provider is a follow-up.
 */
const handlers = new Map<ShortcutId, (() => void)[]>()

const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true // CodeMirror's editable surface
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const dispatch = (event: KeyboardEvent) => {
  // CodeMirror and the schema tree both preventDefault what they consume, so
  // this keeps the bus out of their way without either side knowing the other.
  if (event.defaultPrevented || event.repeat) return

  for (const [id, stack] of handlers) {
    const handler = stack.at(-1)
    if (!handler) continue

    const { combo } = SHORTCUTS[id]
    if (!matchesCombo(event, combo)) continue

    // A modified combo is safe to fire inside a text field. A bare key would
    // not be, and none exist yet, but the guard belongs with the dispatcher.
    if (!hasModifier(combo) && isTextEntryTarget(event.target)) continue

    event.preventDefault()
    handler()
    return
  }
}

const listening = () => handlers.size > 0

/**
 * Adds a handler and returns its removal. The listener is attached with the
 * first registration and dropped with the last, so an unmounted brick leaves
 * nothing behind.
 */
export const registerShortcut = (id: ShortcutId, handler: () => void) => {
  if (typeof document === 'undefined') return () => undefined

  // Bubble phase, like the resizer's drag listeners. Capture would run ahead of
  // CodeMirror and steal keys it has every right to handle first.
  if (!listening()) document.addEventListener('keydown', dispatch)

  const stack = handlers.get(id) ?? []
  stack.push(handler)
  handlers.set(id, stack)

  return () => {
    const current = handlers.get(id)
    if (!current) return

    const at = current.lastIndexOf(handler)
    if (at !== -1) current.splice(at, 1)
    if (current.length === 0) handlers.delete(id)

    if (!listening()) document.removeEventListener('keydown', dispatch)
  }
}
