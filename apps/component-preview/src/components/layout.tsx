import { ReactNode } from 'react'

import * as styles from './layout.css'
import { ThemeToggle } from './theme-toggle'

interface LayoutProps {
  sidebar: ReactNode
  preview: ReactNode
}

export function Layout({ sidebar, preview }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <ThemeToggle />
      </header>
      <div className={styles.content}>
        {sidebar}
        <main className={styles.mainContent}>{preview}</main>
      </div>
    </div>
  )
}
