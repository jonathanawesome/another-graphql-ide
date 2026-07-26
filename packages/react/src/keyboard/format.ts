import { isApplePlatform } from './platform'
import type { KeyToken } from './shortcuts'

const GLYPHS: Record<string, { apple: string; other: string }> = {
  Mod: { apple: '⌘', other: 'Ctrl' },
  Shift: { apple: '⇧', other: 'Shift' },
  Enter: { apple: '↵', other: 'Enter' },
  Escape: { apple: '⎋', other: 'Esc' },
}

const SPOKEN: Record<string, { apple: string; other: string }> = {
  Mod: { apple: 'Command', other: 'Control' },
  Shift: { apple: 'Shift', other: 'Shift' },
}

/** What a key looks like on this platform. Single letters read better capitalized. */
export const formatToken = (
  token: KeyToken,
  mac = isApplePlatform()
): string => {
  const glyph = GLYPHS[token]
  if (glyph) return mac ? glyph.apple : glyph.other
  return token.length === 1 ? token.toUpperCase() : token
}

/**
 * The same combo in words. Screen readers announce `⌘⇧L` as noise, so the
 * glyphs are hidden and this is exposed alongside them.
 */
export const spokenCombo = (
  combo: readonly KeyToken[],
  mac = isApplePlatform()
): string =>
  combo
    .map(token => {
      const spoken = SPOKEN[token]
      if (spoken) return mac ? spoken.apple : spoken.other
      return token.length === 1 ? token.toUpperCase() : token
    })
    .join(' ')
