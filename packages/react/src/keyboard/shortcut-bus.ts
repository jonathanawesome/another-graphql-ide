import { INSTANCE_ATTR } from '../state/instance-id'

import { hasModifier, matchesCombo } from './match'
import { SHORTCUTS, type ShortcutId } from './shortcuts'

/**
 * One listener for the whole page, however many bricks are mounted.
 *
 * Registrations are scoped to an instance (one per store). A keypress goes to
 * the instance containing the event target, else the one last focused or
 * clicked, else the newest. Within an instance the newest registration wins,
 * which is what a modal or overlay will want later. If the chosen instance has
 * no handler, nothing fires: a key pressed in one IDE never reaches another.
 */
type Registration = { instance: string; id: ShortcutId; handler: () => void }

const registrations: Registration[] = []
let lastActive: Element | null = null

const instanceOf = (node: EventTarget | null): string | null =>
  node instanceof Element
    ? (node.closest(`[${INSTANCE_ATTR}]`)?.getAttribute(INSTANCE_ATTR) ?? null)
    : null

const resolveInstance = (event: KeyboardEvent): string | undefined =>
  instanceOf(event.target) ??
  // A detached element means its brick unmounted, so it no longer counts.
  (lastActive?.isConnected ? instanceOf(lastActive) : null) ??
  registrations.at(-1)?.instance

const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true // CodeMirror's editable surface
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const dispatch = (event: KeyboardEvent) => {
  // CodeMirror and the schema tree both preventDefault what they consume, so
  // this keeps the bus out of their way without either side knowing the other.
  if (event.defaultPrevented || event.repeat) return

  const instance = resolveInstance(event)
  if (!instance) return

  // Newest first.
  for (const { instance: owner, id, handler } of [...registrations].reverse()) {
    if (owner !== instance) continue

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

const track = (event: Event) => {
  if (instanceOf(event.target)) lastActive = event.target as Element
}

// Bubble phase for keydown, like the resizer's drag listeners. Capture would
// run ahead of CodeMirror and steal keys it has every right to handle first.
// Tracking uses capture so a brick that stops propagation still counts.
const attach = () => {
  document.addEventListener('keydown', dispatch)
  document.addEventListener('focusin', track, true)
  document.addEventListener('pointerdown', track, true)
}

const detach = () => {
  document.removeEventListener('keydown', dispatch)
  document.removeEventListener('focusin', track, true)
  document.removeEventListener('pointerdown', track, true)
  lastActive = null
}

/**
 * Adds a handler for one instance and returns its removal. Listeners attach
 * with the first registration and drop with the last, so an unmounted brick
 * leaves nothing behind.
 */
export const registerShortcut = (
  instance: string,
  id: ShortcutId,
  handler: () => void
) => {
  if (typeof document === 'undefined') return () => undefined

  if (registrations.length === 0) attach()

  const entry: Registration = { instance, id, handler }
  registrations.push(entry)

  return () => {
    const at = registrations.indexOf(entry)
    if (at === -1) return

    registrations.splice(at, 1)
    if (registrations.length === 0) detach()
  }
}
