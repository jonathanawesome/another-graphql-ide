import { recipe, themeContract } from '@another-graphql-ide/style'

export const editorStyles = {
  container: recipe(
    {
      base: {
        height: '100%',
        width: '100%',
      },
      variants: {
        // An optional visual frame so callers (e.g. the headers editor) get a
        // bordered box from a prop rather than a wrapping element.
        frame: {
          none: {},
          bordered: {
            border: `1px solid ${themeContract.colors.neutral4}`,
            borderRadius: themeContract.radii.small,
            overflow: 'hidden',
          },
        },
      },
      defaultVariants: { frame: 'none' },
    },
    'editor-container'
  ),
}
