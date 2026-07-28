import { useState } from 'react'

import { formatToken, spokenCombo } from '../../../keyboard/format'
import { isApplePlatform } from '../../../keyboard/platform'
import {
  SHORTCUTS,
  type KeyToken,
  type ShortcutId,
} from '../../../keyboard/shortcuts'

import { kbdStyles } from './kbd.css'

export type KbdProps = {
  tone?: 'default' | 'inverted'
} & (
  | { shortcut: ShortcutId; keys?: never }
  | { keys: readonly KeyToken[]; shortcut?: never }
)

/**
 * The keys for a shortcut, drawn as one chip per key.
 *
 * Prefer `shortcut`, which reads the registry, so what is advertised and what
 * actually fires cannot drift. `keys` is for documenting a gesture with no
 * registered command.
 */
export const Kbd = ({ tone = 'default', shortcut, keys }: KbdProps) => {
  // Resolved once on mount rather than per render. A server render would have
  // to assume one platform, but nothing here is server rendered today.
  const [mac] = useState(isApplePlatform)

  const combo = shortcut ? SHORTCUTS[shortcut].combo : keys

  return (
    // The spec's own idiom for a combination: one kbd per key, wrapped in a kbd
    // for the whole gesture.
    <kbd className={kbdStyles.root}>
      {/* Glyphs are hidden from assistive tech, which would otherwise announce
          "⌘⇧L" as punctuation, and the spoken form is exposed instead. */}
      <span className={kbdStyles.spoken}>{spokenCombo(combo, mac)}</span>
      {combo.map(token => (
        <kbd aria-hidden="true" className={kbdStyles.key({ tone })} key={token}>
          {formatToken(token, mac)}
        </kbd>
      ))}
    </kbd>
  )
}
