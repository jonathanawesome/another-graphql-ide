import { themeContract, recipe, style } from '@another-graphql-ide/style'

export const resizerStyles = {
  container: recipe({
    base: {
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    variants: {
      orientation: {
        horizontal: {
          flexDirection: 'row',
        },
        vertical: {
          flexDirection: 'column',
        },
      },
    },
  }),

  pane: style({
    overflow: 'auto',
    position: 'relative',
  }),

  handle: recipe({
    base: {
      position: 'relative',
      transition: `background-color 0.2s ${themeContract.motion.authentic}`,
      flexShrink: 0,

      selectors: {
        '&::after': {
          content: '',
          position: 'absolute',
          zIndex: 1,
          left: '50%',
          top: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          borderRadius: 8,
          transition: 'background-color .15s ease',
          backgroundColor: 'transparent',
        },

        '&:hover::after': {
          backgroundColor: themeContract.colors.neutral8,
        },
      },
    },

    variants: {
      orientation: {
        horizontal: {
          height: '100%',
          width: 12,
          cursor: 'col-resize',

          selectors: {
            '&::after': {
              width: 4,
              height: 110,
            },
          },
        },
        vertical: {
          width: '100%',
          height: 12,
          cursor: 'row-resize',

          selectors: {
            '&::after': {
              height: 4,
              width: 110,
            },
          },
        },
      },
      isDragging: {
        true: {},
        false: {},
      },
    },
  }),
}
