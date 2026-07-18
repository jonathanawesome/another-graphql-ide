import { themeContract } from '@another-graphql-ide/style'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * Syntax highlighting for all languages, mapping Lezer highlight tags to the
 * design-system palette. This is intentionally a minimal palette built from
 * tokens that exist today — richer, purpose-built syntax colors can be added
 * later as new `themeContract` tokens without touching the component API.
 */
const highlightStyle = HighlightStyle.define([
  {
    tag: [t.keyword, t.operatorKeyword, t.modifier],
    color: themeContract.colors.brand,
  },
  {
    tag: [t.definitionKeyword, t.controlKeyword],
    color: themeContract.colors.brand,
  },
  {
    tag: [t.propertyName, t.attributeName],
    color: themeContract.colors.neutral8,
  },
  {
    tag: [t.typeName, t.className, t.namespace],
    color: themeContract.colors.neutral7,
  },
  {
    tag: [t.string, t.special(t.string)],
    color: themeContract.colors.neutral7,
  },
  {
    tag: [t.number, t.bool, t.null, t.atom],
    color: themeContract.colors.neutral7,
  },
  {
    tag: [t.variableName, t.function(t.variableName)],
    color: themeContract.colors.neutral8,
  },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: themeContract.colors.neutral5,
    fontStyle: 'italic',
  },
  {
    tag: [t.punctuation, t.separator, t.bracket],
    color: themeContract.colors.neutral6,
  },
  { tag: [t.meta], color: themeContract.colors.neutral6 },
  { tag: t.invalid, color: themeContract.colors.neutral8 },
])

/** Extension enabling the shared highlight style. */
export const editorHighlight = syntaxHighlighting(highlightStyle)
