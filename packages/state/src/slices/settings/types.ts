/**
 * How a newly inserted object-typed field gets its subselection. `typename`
 * inserts `{ __typename }` (valid immediately); `bare` inserts the field with no
 * subselection, leaving it for the user to fill (schema-invalid until they do,
 * but still parseable so further edits keep working).
 */
export type ObjectFieldInsertionMode = 'typename' | 'bare'

export type SettingsSlice = {
  objectFieldInsertionMode: ObjectFieldInsertionMode
  setObjectFieldInsertionMode: (mode: ObjectFieldInsertionMode) => void
}
