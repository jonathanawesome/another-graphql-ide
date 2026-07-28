import { themeContract } from '@another-graphql-ide/style'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * Syntax highlighting for all languages, mapping Lezer highlight tags to the
 * design-system palette. This is intentionally a minimal palette built from
 * tokens that exist today. Richer, purpose-built syntax colors can be added
 * later as new `themeContract` tokens without touching the component API.
 *
 * There are no language-specific tags. Every grammar maps its own nodes onto
 * the one generic `@lezer/highlight` vocabulary, so the per-rule comments name
 * what each of our four languages actually paints with that rule. A language
 * omitted from a rule emits nothing that reaches it. Sources of truth are the
 * `styleTags` calls in cm6-graphql, @lezer/javascript and codemirror-json5.
 */
const highlightStyle = HighlightStyle.define([
  {
    // GraphQL: SDL keywords (scalar, type, interface, union, enum, input,
    //   implements, fragment, extend, schema, directive, on, repeatable), and
    //   directive names such as @include via modifier.
    // JS/TS: with, debugger, new; the operator-like words (in, of, await,
    //   yield, void, typeof, delete, instanceof, as, satisfies, keyof, infer);
    //   and get, set, async, static, abstract, readonly, override.
    tag: [t.keyword, t.operatorKeyword, t.modifier],
    color: themeContract.colors.brand,
  },
  {
    // GraphQL: operation types (query, mutation, subscription).
    // JS/TS: let, var, const, function, class, extends, plus the TS type
    //   declarations (type, enum, interface, namespace, declare) and every
    //   control-flow keyword (if, else, for, while, return, try, ...).
    tag: [t.definitionKeyword, t.controlKeyword],
    color: themeContract.colors.brand,
  },
  {
    // GraphQL: selected fields, and argument names in a field's argument list.
    // JS/TS: object property names and definitions, and JSX attribute names.
    // JSON5: object keys.
    tag: [t.propertyName, t.attributeName],
    color: themeContract.colors.neutral8,
  },
  {
    // TS: annotated type names and type definitions.
    // JS: class declarations and `new Foo()` callees.
    // Not reached by GraphQL, whose type names arrive as t.atom below.
    tag: [t.typeName, t.className, t.namespace],
    color: themeContract.colors.neutral7,
  },
  {
    // GraphQL: string values and block-string descriptions.
    // JS/TS: string literals, and template strings via special(string).
    // JSON5: string values.
    tag: [t.string, t.special(t.string)],
    color: themeContract.colors.neutral7,
  },
  {
    // GraphQL: int and float values (both subtags of number), true/false, null,
    //   and t.atom, which is cm6-graphql's catch-all Name node and so also
    //   covers type names, fragment names and operation names.
    // JS/TS: numbers, booleans, null, and `super` via atom.
    // JSON5: numbers, booleans, null.
    tag: [t.number, t.bool, t.null, t.atom],
    color: themeContract.colors.neutral7,
  },
  {
    // GraphQL: $variables, in both definitions and usages.
    // JS/TS: variable references, and call or tagged-template callees.
    tag: [t.variableName, t.function(t.variableName)],
    color: themeContract.colors.neutral8,
  },
  {
    // GraphQL: # line comments, the only comment form it has.
    // JS/TS: // and hashbang lines, and /* */ blocks.
    // JSON5: both // and /* */.
    tag: [t.comment, t.lineComment, t.blockComment],
    color: themeContract.colors.neutral5,
    fontStyle: 'italic',
  },
  {
    // GraphQL: braces, parens, square brackets and colons, commas as separator.
    // JS/TS: colons and spreads, all bracket forms, and commas/semicolons.
    // JSON5: braces and square brackets, with commas and key colons as
    //   separators.
    tag: [t.punctuation, t.separator, t.bracket],
    color: themeContract.colors.neutral6,
  },
  // JS/TS: the @ of a decorator. Not emitted by GraphQL or JSON5.
  { tag: [t.meta], color: themeContract.colors.neutral6 },
  // Error nodes. None of our four grammars tag anything as invalid today.
  { tag: t.invalid, color: themeContract.colors.neutral8 },
  // Known fall-throughs to the base color in editorTheme: GraphQL enum values
  // (tagged special(name)), and JS/TS operators and JSX tag names.
])

/** Extension enabling the shared highlight style. */
export const editorHighlight = syntaxHighlighting(highlightStyle)
