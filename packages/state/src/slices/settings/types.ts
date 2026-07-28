/**
 * How a newly inserted object-typed field gets its subselection. `typename`
 * inserts `{ __typename }` (valid immediately); `bare` inserts the field with no
 * subselection, leaving it for the user to fill (schema-invalid until they do,
 * but still parseable so further edits keep working).
 */
export type ObjectFieldInsertionMode = 'typename' | 'bare'

/**
 * Colour scheme preference. `system` follows the OS, which is resolved where
 * the DOM is: this package stays free of `matchMedia`.
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * User preferences. Every one is a flat top-level key on purpose: the generated
 * selectors are per key, so a component subscribes to the one preference it
 * reads, and persistence merges keys individually rather than replacing a
 * nested object and dropping newly added defaults. Grouping preferences for
 * display is the settings panel's job.
 */
export type SettingsSlice = {
  objectFieldInsertionMode: ObjectFieldInsertionMode
  setObjectFieldInsertionMode: (mode: ObjectFieldInsertionMode) => void
  /**
   * Flips to the other mode. Like the toggle below, this exists because a
   * keyboard shortcut has no current value in hand; it stays a toggle rather
   * than a cycle only as long as there are two modes.
   */
  toggleObjectFieldInsertionMode: () => void

  /** Show each field's return type, and each argument's input type, on its row. */
  showFieldTypes: boolean
  setShowFieldTypes: (show: boolean) => void
  /**
   * Kept alongside the setter because a keyboard shortcut has no current value
   * in hand, and reading one through a closure would go stale.
   */
  toggleShowFieldTypes: () => void

  theme: Theme
  setTheme: (theme: Theme) => void
}
