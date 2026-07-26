/**
 * `Mod` is Command on Apple platforms and Control everywhere else, matching
 * CodeMirror's convention so the editor and the rest of the app agree.
 *
 * Deliberately no `Alt`: on macOS, Option rewrites `event.key` (Option-K
 * arrives as `˚`), which makes a combo containing it layout-dependent.
 */
export type ModifierToken = 'Mod' | 'Shift'

/** Modifiers first, the key itself last. */
export type KeyToken = ModifierToken | (string & {})

export type ShortcutDefinition = {
  combo: readonly KeyToken[]
  /** Imperative voice. Shown next to the control it drives, and in a future help panel. */
  label: string
  /** Section heading for that help panel. */
  group: string
}

/**
 * Every shortcut the library knows, and the single source of truth for both
 * dispatching and displaying them. A shortcut nobody can discover is not worth
 * having, so the definition that fires it is also the one drawn on screen.
 *
 * Picking a combo means clearing three lists. Browsers reserve Mod+Shift+T
 * (reopens a tab, and Chrome will not let a page have it), N and P (private
 * window), I, J and C (devtools), K (Firefox console), R (reload), and W and Q.
 * CodeMirror claims Mod-f, Mod-g, Mod-z, Mod-d, Mod-Shift-z/g/r/m, Ctrl-Space
 * and Tab. GraphiQL's Mod-Shift-P and Mod-Shift-M are worth leaving free so
 * prettify and merge can adopt them later.
 */
export const SHORTCUTS = {
  'schema-tree.toggle-field-types': {
    combo: ['Mod', 'Shift', 'L'],
    label: 'Toggle return types',
    group: 'Schema tree',
  },
} as const satisfies Record<string, ShortcutDefinition>

/** `satisfies` above keeps this a union of literals, so a typo is a type error. */
export type ShortcutId = keyof typeof SHORTCUTS

export const shortcutEntries = () =>
  Object.entries(SHORTCUTS) as [ShortcutId, ShortcutDefinition][]
