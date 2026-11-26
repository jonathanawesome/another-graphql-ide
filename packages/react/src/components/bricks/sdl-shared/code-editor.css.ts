import { recipe, themeContract } from '@another-graphql-ide/style'

export const codeEditorStyles = {
  root: recipe(
    {
      base: {
        display: 'grid',
        // One cell the size of the frame, so the editor scrolls inside it.
        gridTemplate: 'minmax(0, 1fr) / minmax(0, 1fr)',
        height: '100%',
        width: '100%',
        minWidth: 0,
        backgroundColor: themeContract.bg.surface,
      },
      variants: {
        frame: {
          none: {},
          bordered: {
            border: `1px solid ${themeContract.border.default}`,
            borderRadius: themeContract.radii.lg,
            overflow: 'hidden',
          },
        },
      },
      defaultVariants: { frame: 'none' },
    },
    'code-editor'
  ),
}
