import { style, themeContract } from '@another-graphql-ide/style'

export const editorGroupStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: themeContract.colors.neutral2,
      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.medium,
      overflow: 'hidden',
      height: '100%',
      boxShadow: themeContract.shadows.box,
    },
    'editor-group-container'
  ),
}
