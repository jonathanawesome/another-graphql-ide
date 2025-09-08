import { Icon } from '../../../../packages/react/src/ui-components/icon/icon'

import * as styles from './shelf-toggle.css'

interface ShelfToggleProps {
  onClick: () => void
}

export function ShelfToggle({ onClick }: ShelfToggleProps) {
  return (
    <button
      className={styles.toggle}
      onClick={onClick}
      title="Open Component List"
    >
      <Icon name="Settings2" />
    </button>
  )
}
