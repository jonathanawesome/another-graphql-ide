import { ReactNode } from 'react'

import * as styles from './shelf.css'

interface ShelfProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  isPinned: boolean
}

export function Shelf({ isOpen, onClose, children, isPinned }: ShelfProps) {
  return (
    <>
      {isOpen && !isPinned && (
        <div
          className={styles.overlay}
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={0}
        />
      )}
      <aside className={styles.shelf} data-open={isOpen} data-pinned={isPinned}>
        <div className={styles.header} />
        <div className={styles.content}>{children}</div>
      </aside>
    </>
  )
}
