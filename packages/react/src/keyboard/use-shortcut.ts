import { useEffect, useRef } from 'react'

import { useInstanceId } from '../state/instance-id'

import { registerShortcut } from './shortcut-bus'
import type { ShortcutId } from './shortcuts'

/**
 * Runs `handler` when its shortcut is pressed within this brick's instance.
 * Call once per brick, at the brick's root, never per row. The root must also
 * spread `useInstanceAttr()` so the bus can route keys to it.
 *
 * The handler is registered through a ref so a re-render does not unregister
 * and re-register it. That would reshuffle the stack the bus uses to decide
 * which registration wins, and would make the winner depend on render order.
 */
export const useShortcut = (id: ShortcutId, handler: () => void) => {
  const instance = useInstanceId()
  const latest = useRef(handler)

  // Written in an effect, not during render: a render React discards would
  // otherwise leave its handler behind. The bus only calls this from a keyboard
  // event, which is always after effects have flushed.
  useEffect(() => {
    latest.current = handler
  })

  useEffect(
    () => registerShortcut(instance, id, () => latest.current()),
    [instance, id]
  )
}
