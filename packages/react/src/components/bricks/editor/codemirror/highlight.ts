import { themeContract } from '@another-graphql-ide/style'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * Syntax highlighting for all languages, mapping Lezer highlight tags to the
 * `syntax` tokens of the theme contract.
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
    //   implements, fragment, extend, schema, directive, on, repeatable).
    // JS/TS: with, debugger, new; and the operator-like words (in, of, await,
    //   yield, void, typeof, delete, instanceof, as, satisfies, keyof, infer).
    tag: [t.keyword, t.operatorKeyword],
    color: themeContract.syntax.keyword,
  },
  {
    // GraphQL: directive names such as @include.
    // JS/TS: get, set, async, static, abstract, readonly, override.
    tag: [t.modifier],
    color: themeContract.syntax.function,
  },
  {
    // GraphQL: operation types (query, mutation, subscription).
    // JS/TS: let, var, const, function, class, extends, plus the TS type
    //   declarations (type, enum, interface, namespace, declare) and every
    //   control-flow keyword (if, else, for, while, return, try, ...).
    tag: [t.definitionKeyword, t.controlKeyword],
    color: themeContract.syntax.keyword,
  },
  {
    // GraphQL: selected fields, and argument names in a field's argument list.
    // JS/TS: object property names and definitions, and JSX attribute names.
    // JSON5: object keys.
    tag: [t.propertyName, t.attributeName],
    color: themeContract.text.primary,
  },
  {
    // TS: annotated type names and type definitions.
    // JS: class declarations and `new Foo()` callees.
    // GraphQL: t.atom, cm6-graphql's catch-all Name node, which covers type
    //   names, fragment names and operation names.
    // JS/TS: also `super` via atom.
    tag: [t.typeName, t.className, t.namespace, t.atom],
    color: themeContract.syntax.type,
  },
  {
    // GraphQL: string values and block-string descriptions.
    // JS/TS: string literals, and template strings via special(string).
    // JSON5: string values.
    tag: [t.string, t.special(t.string)],
    color: themeContract.syntax.string,
  },
  {
    // GraphQL: int and float values (both subtags of number), true/false, null.
    // JS/TS: numbers, booleans, null.
    // JSON5: numbers, booleans, null.
    tag: [t.number, t.bool, t.null],
    color: themeContract.syntax.number,
  },
  {
    // GraphQL: $variables, in both definitions and usages.
    // JS/TS: variable references.
    tag: [t.variableName],
    color: themeContract.text.primary,
  },
  {
    // JS/TS: call and tagged-template callees.
    tag: [t.function(t.variableName)],
    color: themeContract.syntax.function,
  },
  {
    // GraphQL: # line comments, the only comment form it has.
    // JS/TS: // and hashbang lines, and /* */ blocks.
    // JSON5: both // and /* */.
    tag: [t.comment, t.lineComment, t.blockComment],
    color: themeContract.syntax.comment,
  },
  {
    // GraphQL: braces, parens, square brackets and colons, commas as separator.
    // JS/TS: colons and spreads, all bracket forms, and commas/semicolons.
    // JSON5: braces and square brackets, with commas and key colons as
    //   separators.
    tag: [t.punctuation, t.separator, t.bracket],
    color: themeContract.syntax.punctuation,
  },
  // JS/TS: the @ of a decorator. Not emitted by GraphQL or JSON5.
  { tag: [t.meta], color: themeContract.syntax.punctuation },
  // Error nodes. None of our four grammars tag anything as invalid today.
  { tag: t.invalid, color: themeContract.text.primary },
  // Known fall-throughs to the base color in editorTheme: GraphQL enum values
  // (tagged special(name)), and JS/TS operators and JSX tag names.
])

/** Extension enabling the shared highlight style. */
export const editorHighlight = syntaxHighlighting(highlightStyle)
