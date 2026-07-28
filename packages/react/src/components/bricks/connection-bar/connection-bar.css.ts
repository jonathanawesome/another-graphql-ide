import { recipe, style, themeContract } from '@another-graphql-ide/style'

// The palette has no semantic status colors yet, so connected reuses `brand` and
// error uses a literal red. Swap these for tokens once the contract grows them.
const ERROR_COLOR = 'oklch(63% 0.23 25)'

export const connectionBarStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[8],
      width: '100%',
      padding: themeContract.px[8],
      backgroundColor: themeContract.colors.neutral2,
      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.medium,
    },
    'connection-bar-container'
  ),

  endpoint: style({ flex: 1, minWidth: 0 }, 'connection-bar-endpoint'),

  actions: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[6],
      flexShrink: 0,
    },
    'connection-bar-actions'
  ),

  status: style(
    {
      display: 'flex',
      alignItems: 'center',
      gap: themeContract.px[6],
      fontSize: themeContract.px[12],
      color: themeContract.colors.neutral6,
      whiteSpace: 'nowrap',
    },
    'connection-bar-status'
  ),

  statusDot: recipe(
    {
      base: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: themeContract.colors.neutral5,
        transition: `background-color 0.15s ${themeContract.motion.authentic}`,
      },
      variants: {
        tone: {
          idle: {},
          connecting: { backgroundColor: themeContract.colors.neutral6 },
          connected: { backgroundColor: themeContract.colors.brand },
          error: { backgroundColor: ERROR_COLOR },
        },
      },
    },
    'connection-bar-status-dot'
  ),
}
