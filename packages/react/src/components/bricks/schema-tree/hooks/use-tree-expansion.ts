import { useCallback, useEffect, useState } from 'react'

const EMPTY: ReadonlySet<string> = new Set()

/**
 * Which node paths are open, held above the virtualizer.
 *
 * It cannot live on the rows themselves: a virtualized row unmounts when it
 * scrolls out of view, which would silently collapse whatever it had open. It
 * stays out of the store because expansion is per-tree view state, not
 * application state, and two trees on one store should open independently.
 *
 * One set covers every tab, because ids are already prefixed with their root
 * operation.
 */
export function useTreeExpansion(schemaKey: unknown) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(EMPTY)

  // Paths from the previous schema mean nothing in the new one.
  useEffect(() => setExpanded(EMPTY), [schemaKey])

  const toggleExpanded = useCallback((id: string) => {
    setExpanded(previous => {
      const next = new Set(previous)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])

  return { expanded, toggleExpanded }
}
