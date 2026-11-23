import { style, themeContract } from '@another-graphql-ide/style'

export const settingsContentStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[8],
  }),
  title: style({
    fontSize: themeContract.px[12],
    fontWeight: 600,
    color: themeContract.colors.neutral7,
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
    fontSize: themeContract.px[13],
    color: themeContract.colors.neutral8,
    cursor: 'pointer',
  }),

  // Like `option`, but the text takes the slack so the shortcut sits at the
  // trailing edge however long the label is.
  shortcutOption: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    fontSize: themeContract.px[13],
    color: themeContract.colors.neutral8,
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
    border: `1px solid ${themeContract.colors.neutral5}`,
    backgroundColor: themeContract.colors.neutral1,
    cursor: 'pointer',
    selectors: {
      '&[data-checked]': {
        borderColor: themeContract.colors.brand,
      },
    },
  }),
  indicator: style({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: themeContract.colors.brand,
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
    borderRadius: themeContract.radii.small,
    border: `1px solid ${themeContract.colors.neutral5}`,
    backgroundColor: themeContract.colors.neutral1,
    cursor: 'pointer',
    selectors: {
      '&[data-checked]': {
        borderColor: themeContract.colors.brand,
      },
    },
  }),

  // A filled square rather than a checkmark: the icon set has no check glyph,
  // and the filled shape already reads as "on" from the radio above.
  checkIndicator: style({
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: themeContract.colors.brand,
    selectors: {
      '&[data-unchecked]': {
        display: 'none',
      },
    },
  }),
}
