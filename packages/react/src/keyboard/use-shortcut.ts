import { useEffect, useRef } from 'react'

import { registerShortcut } from './shortcut-bus'
import type { ShortcutId } from './shortcuts'

/**
 * Runs `handler` when its shortcut is pressed. Call once per brick, at the
 * brick's root, never per row.
 *
 * The handler is registered through a ref so a re-render does not unregister
 * and re-register it. That would reshuffle the stack the bus uses to decide
 * which instance wins, and would make the winner depend on render order.
 */
export const useShortcut = (id: ShortcutId, handler: () => void) => {
  const latest = useRef(handler)
  latest.current = handler

  useEffect(() => registerShortcut(id, () => latest.current()), [id])
}
