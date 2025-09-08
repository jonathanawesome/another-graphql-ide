import { ReactNode } from 'react'

import { Icon } from '../../../../packages/react/src/ui-components/icon/icon'

import * as styles from './shelf.css'

interface ShelfProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Shelf({ isOpen, onClose, children }: ShelfProps) {
  return (
    <>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={0}
        />
      )}
      <aside className={styles.shelf} data-open={isOpen}>
        <button className={styles.closeButton} onClick={onClose}>
          <Icon name="X" />
        </button>
        <div className={styles.content}>{children}</div>
      </aside>
    </>
  )
}
