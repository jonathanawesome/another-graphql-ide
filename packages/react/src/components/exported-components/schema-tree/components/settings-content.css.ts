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
}
