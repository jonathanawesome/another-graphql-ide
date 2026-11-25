import {
  recipe,
  style,
  textStyles,
  themeContract,
} from '@another-graphql-ide/style'

export const sdlFrameStyles = {
  root: recipe(
    {
      base: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        backgroundColor: themeContract.bg.surface,
      },
      variants: {
        frame: {
          none: {},
          bordered: {
            border: `1px solid ${themeContract.border.subtle}`,
            borderRadius: themeContract.radii.md,
            overflow: 'hidden',
          },
        },
      },
      defaultVariants: { frame: 'none' },
    },
    'sdl-frame'
  ),

  body: style({
    position: 'relative',
    flex: 1,
    minHeight: 0,
  }),

  // Contains CodeMirror's z-indexed panels, so the overlays can cover them.
  editor: style({
    height: '100%',
    isolation: 'isolate',
  }),

  // Loading and empty states sit over the editor, which stays mounted.
  overlay: style({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: themeContract.bg.surface,
  }),

  empty: style({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeContract.px[40],
    ...textStyles.bodyDense,
    color: themeContract.text.secondary,
    textAlign: 'center',
  }),
}
