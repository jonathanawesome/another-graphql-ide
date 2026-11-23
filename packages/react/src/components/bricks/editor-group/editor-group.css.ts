import { style, themeContract } from '@another-graphql-ide/style'

export const editorGroupStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${themeContract.border.subtle}`,
      borderRadius: themeContract.radii.md,
      overflow: 'hidden',
      height: '100%',
      padding: themeContract.px[12],
    },
    'editor-group-container'
  ),
}
