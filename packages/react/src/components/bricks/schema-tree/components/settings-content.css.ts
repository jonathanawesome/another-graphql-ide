import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const settingsContentStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[8],
  }),
  title: style({
    ...textStyles.label,
    color: themeContract.text.secondary,
  }),
  // A heading that carries a shortcut chip, kept at the trailing edge like the
  // one on a labeled control.
  titleRow: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeContract.px[16],
  }),
  group: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[6],
  }),
  option: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    ...textStyles.bodyDense,
    color: themeContract.text.primary,
    cursor: 'pointer',
  }),

  // Like `option`, but the text takes the slack so the shortcut sits at the
  // trailing edge however long the label is.
  shortcutOption: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    ...textStyles.bodyDense,
    color: themeContract.text.primary,
    cursor: 'pointer',
  }),

  optionText: style({
    flex: 1,
    marginRight: themeContract.px[16],
  }),
  radio: style({
    display: 'grid',
    placeItems: 'center',
    width: 16,
    height: 16,
    padding: 0,
    borderRadius: '50%',
    border: `1px solid ${themeContract.border.control}`,
    backgroundColor: themeContract.bg.inset,
    cursor: 'pointer',
    selectors: {
      '&[data-checked]': {
        borderColor: themeContract.accent.line,
      },
    },
  }),
  indicator: style({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: themeContract.accent.line,
    selectors: {
      '&[data-unchecked]': {
        display: 'none',
      },
    },
  }),

  // The radio pair with square corners. Base UI exposes the same
  // data-checked/data-unchecked attributes, so the states carry over.
  checkbox: style({
    display: 'grid',
    placeItems: 'center',
    width: 16,
    height: 16,
    padding: 0,
    borderRadius: themeContract.px[4],
    border: `1px solid ${themeContract.border.control}`,
    backgroundColor: themeContract.bg.inset,
    cursor: 'pointer',
    selectors: {
      '&[data-checked]': {
        borderColor: themeContract.accent.line,
      },
    },
  }),

  // A filled square rather than a checkmark: the icon set has no check glyph,
  // and the filled shape already reads as "on" from the radio above.
  checkIndicator: style({
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: themeContract.accent.line,
    selectors: {
      '&[data-unchecked]': {
        display: 'none',
      },
    },
  }),
}
