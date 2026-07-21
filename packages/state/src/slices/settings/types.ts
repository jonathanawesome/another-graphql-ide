/**
 * How a newly inserted object-typed field gets its required subselection.
 * `typename` inserts `{ __typename }` (valid immediately); `empty-braces`
 * inserts empty braces and places the caret inside for the user to fill.
 */
export type ObjectFieldInsertionMode = 'typename' | 'empty-braces'

export type SettingsSlice = {
  objectFieldInsertionMode: ObjectFieldInsertionMode
  setObjectFieldInsertionMode: (mode: ObjectFieldInsertionMode) => void
}
