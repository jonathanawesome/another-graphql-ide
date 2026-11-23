export { ThemeProvider, ThemeContext } from './theme-provider'
export type { Theme, ThemeContextValue } from './theme-provider'
export { useTheme } from './use-theme'
export { themeVars, type ThemeTokens } from './theme-vars'
// Theme classes for scoping a whole theme to a wrapper, and the token refs
// (`var(--agi-*)`) for host styles that should follow the active theme.
export {
  darkTheme,
  lightTheme,
  themeContract as tokens,
} from '@another-graphql-ide/style'
