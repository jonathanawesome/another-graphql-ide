import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const connectionBarStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[8],
      width: '100%',
      padding: themeContract.px[8],
      backgroundColor: themeContract.bg.surface,
      border: `1px solid ${themeContract.border.subtle}`,
      borderRadius: themeContract.radii.md,
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
      color: themeContract.text.tertiary,
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
        backgroundColor: themeContract.border.strong,
        transition: `background-color 0.15s ${themeContract.motion.authentic}`,
      },
      variants: {
        tone: {
          idle: {},
          connecting: { backgroundColor: themeContract.text.tertiary },
          connected: { backgroundColor: themeContract.status.success },
          error: { backgroundColor: themeContract.status.danger },
        },
      },
    },
    'connection-bar-status-dot'
  ),
}
