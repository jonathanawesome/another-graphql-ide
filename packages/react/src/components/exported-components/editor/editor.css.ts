import { style, themeContract } from '@another-graphql-ide/style'

export const editorStyles = {
  container: style(
    {
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: themeContract.colors.neutral2,
      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.medium,
      fontFamily: themeContract.fonts.mono,
    },
    'editor-container'
  ),
}
