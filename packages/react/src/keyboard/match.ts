import { isApplePlatform } from './platform'
import type { KeyToken } from './shortcuts'

/** Whether a combo carries a modifier, so bare keys can be treated differently. */
export const hasModifier = (combo: readonly KeyToken[]): boolean =>
  combo.length > 1

/**
 * Whether a keydown is this combo.
 *
 * Compares `event.key`, never `event.code`: `code` is the physical key, so it
 * would fire on the wrong letter under any non-QWERTY layout.
 *
 * Modifiers must match exactly, not merely be present. Control-Shift-L on a Mac
 * is not the Command shortcut, and adding Alt to a combo makes it a different
 * gesture that should not fire this one.
 */
export const matchesCombo = (
  event: Pick<
    KeyboardEvent,
    'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'
  >,
  combo: readonly KeyToken[],
  mac = isApplePlatform()
): boolean => {
  const key = combo.at(-1)
  if (!key) return false

  const modifiers = combo.slice(0, -1)
  const needsMod = modifiers.includes('Mod')
  const needsShift = modifiers.includes('Shift')

  const modPressed = mac ? event.metaKey : event.ctrlKey
  const otherModifier = mac ? event.ctrlKey : event.metaKey

  return (
    event.key.toLowerCase() === key.toLowerCase() &&
    modPressed === needsMod &&
    !otherModifier &&
    event.shiftKey === needsShift &&
    !event.altKey
  )
}
