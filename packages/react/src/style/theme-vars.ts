import { themeContract } from '@another-graphql-ide/style'
import type { CSSProperties } from 'react'

type Contract = typeof themeContract

/** Any subset of the theme tokens, grouped as in the contract. */
export type ThemeTokens = {
  [Group in keyof Contract]?: { [Token in keyof Contract[Group]]?: string }
}

/** `var(--agi-colors-brand)` -> `--agi-colors-brand` */
const propertyName = (ref: string) => ref.slice(4, -1)

/**
 * Turns token overrides into CSS custom properties for a `style` prop. Put it on
 * any wrapper to restyle the instances inside without touching the rest of the
 * page:
 *
 *   <div style={themeVars({ colors: { brand: 'oklch(60% 0.18 250)' } })}>
 */
type Groups = Record<string, Record<string, string | undefined> | undefined>

export const themeVars = (tokens: ThemeTokens): CSSProperties => {
  const refs = themeContract as unknown as Record<
    string,
    Record<string, string>
  >
  const vars: Record<string, string> = {}

  for (const [group, values] of Object.entries(tokens as Groups)) {
    for (const [token, value] of Object.entries(values ?? {})) {
      const ref = refs[group]?.[token]
      if (ref && value !== undefined) vars[propertyName(ref)] = value
    }
  }

  return vars
}
