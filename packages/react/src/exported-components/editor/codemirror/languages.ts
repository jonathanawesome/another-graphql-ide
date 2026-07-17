import { javascript } from '@codemirror/lang-javascript'
import type { Extension } from '@codemirror/state'
import { graphql } from 'cm6-graphql'
import { json5 } from 'codemirror-json5'
import type { GraphQLSchema } from 'graphql'

import type { EditorLanguage } from './types'

// Re-exported so the rest of the module never imports cm6-graphql directly —
// used to swap the schema on a live GraphQL editor without a full reconfigure.
export { updateSchema } from 'cm6-graphql'

/**
 * Declarative registry mapping each supported language to a factory that
 * produces its CodeMirror extension. Adding a language means adding a line
 * here — nothing else in the module needs to change.
 *
 * The GraphQL factory takes the schema so that, when provided, cm6-graphql
 * wires up schema-aware autocompletion, linting, and hover.
 */
const LANGUAGES: Record<
  EditorLanguage,
  (schema?: GraphQLSchema) => Extension
> = {
  graphql: schema => graphql(schema),
  json5: () => json5(),
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
}

/**
 * Resolve the CodeMirror language extension for the given language, passing the
 * schema through to GraphQL when present.
 */
export const languageExtension = (
  language: EditorLanguage,
  schema?: GraphQLSchema
): Extension => LANGUAGES[language](schema)
