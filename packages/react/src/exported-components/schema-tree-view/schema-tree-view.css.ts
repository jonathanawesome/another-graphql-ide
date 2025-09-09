import { style, themeContract } from '@another-graphql-ide/style'

export const schemaTreeViewStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: themeContract.colors.neutral2,
    border: `1px solid ${themeContract.colors.neutral4}`,
    borderRadius: themeContract.radii.medium,
    overflow: 'hidden',
    height: '100%',
    boxShadow: themeContract.shadows.box,
  }),

  searchContainer: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    padding: themeContract.px[12],
    borderBottom: `1px solid ${themeContract.colors.neutral4}`,
    backgroundColor: themeContract.colors.neutral1,
  }),

  searchInput: style({
    flex: 1,
    padding: `${themeContract.px[6]} ${themeContract.px[8]}`,
    border: `1px solid ${themeContract.colors.neutral4}`,
    borderRadius: themeContract.radii.small,
    backgroundColor: themeContract.colors.neutral1,
    color: themeContract.colors.textRegular,
    fontSize: themeContract.px[14],
    fontFamily: themeContract.fonts.sans,

    '::placeholder': {
      color: themeContract.colors.textLight,
    },

    ':focus': {
      outline: 'none',
      borderColor: themeContract.colors.brand,
      boxShadow: `0 0 0 1px ${themeContract.colors.brand}`,
    },
  }),

  tabContainer: style({
    borderBottom: `1px solid ${themeContract.colors.neutral4}`,
  }),

  treeContainer: style({
    flex: 1,
    overflow: 'auto',
    padding: themeContract.px[8],
  }),

  emptyState: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeContract.px[32],
    color: themeContract.colors.textLight,
    fontSize: themeContract.px[14],
    fontStyle: 'italic',
    textAlign: 'center',
  }),

  treeNode: style({
    marginBottom: themeContract.px[2],
  }),

  nodeContent: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[4],
    padding: `${themeContract.px[4]} ${themeContract.px[8]}`,
    borderRadius: themeContract.radii.small,
    cursor: 'pointer',
    transition: `background-color ${themeContract.motion.authentic}`,

    ':hover': {
      backgroundColor: themeContract.colors.neutral3,
    },
  }),

  nodeInfo: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[6],
    flex: 1,
  }),

  nodeName: style({
    fontSize: themeContract.px[14],
    fontWeight: '500',
    color: themeContract.colors.textStrong,
    fontFamily: themeContract.fonts.mono,
  }),

  nodeType: style({
    fontSize: themeContract.px[13],
    color: themeContract.colors.textLight,
    fontFamily: themeContract.fonts.mono,
    fontStyle: 'italic',
  }),

  nodeChildren: style({
    marginLeft: themeContract.px[16],
    borderLeft: `1px solid ${themeContract.colors.neutral4}`,
    paddingLeft: themeContract.px[8],
  }),
}
