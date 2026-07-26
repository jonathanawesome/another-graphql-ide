/**
 * How a newly inserted object-typed field gets its subselection. `typename`
 * inserts `{ __typename }` (valid immediately); `bare` inserts the field with no
 * subselection, leaving it for the user to fill (schema-invalid until they do,
 * but still parseable so further edits keep working).
 */
export type ObjectFieldInsertionMode = 'typename' | 'bare'

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

  /** Show each field's return type, and each argument's input type, on its row. */
  showFieldTypes: boolean
  setShowFieldTypes: (show: boolean) => void
  /**
   * Kept alongside the setter because a keyboard shortcut has no current value
   * in hand, and reading one through a closure would go stale.
   */
  toggleShowFieldTypes: () => void
}
