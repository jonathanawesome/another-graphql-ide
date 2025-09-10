import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const schemaTreeViewStyles = {
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
    'container'
  ),

  searchContainer: style(
    {
      display: 'flex',
      alignItems: 'center',
      gap: themeContract.px[8],
      borderBottom: `1px solid ${themeContract.colors.neutral4}`,
      backgroundColor: themeContract.colors.neutral1,
    },
    'search-container'
  ),

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

  treeContainer: style(
    {
      flex: 1,
      height: '100%',
      overflow: 'auto',
      padding: themeContract.px[8],
    },
    'tree-container'
  ),

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

  virtualList: style(
    {
      position: 'relative',
      width: '100%',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    'virtual-list'
  ),

  listItem: style(
    {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
    },
    'list-item'
  ),

  listItemInner: style(
    {
      display: 'flex',
      alignItems: 'center',
      gap: themeContract.px[4],
      // padding: `${themeContract.px[4]} ${themeContract.px[8]}`,
      // borderRadius: themeContract.radii.small,
      // cursor: 'pointer',
      // transition: `background-color ${themeContract.motion.authentic}`,

      // ':hover': {
      //   backgroundColor: themeContract.colors.neutral3,
      // },
    },
    'list-item-inner'
  ),

  listItemDetail: style(
    {
      display: 'flex',
      alignItems: 'center',
      gap: themeContract.px[6],
      flex: 1,
    },
    'list-item-detail'
  ),

  listItemName: style(
    {
      color: themeContract.colors.textRegular,
      cursor: 'pointer',

      ':hover': {
        color: themeContract.colors.textStrong,
      },
    },
    'list-item-name'
  ),

  listItemArgumentsLabel: style(
    {
      color: themeContract.colors.textLight,
      fontSize: themeContract.px[12],
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    'list-item-arguments-label'
  ),

  listItemActionsContainer: recipe(
    {
      base: {
        transition: `all .35s ${themeContract.motion.authentic}`,
      },
      variants: {
        showActions: {
          false: { opacity: 0, visibility: 'hidden' },
          true: {
            opacity: 1,
            visibility: 'visible',
          },
        },
      },
    },
    'list-item-name-actions-container'
  ),

  nodeType: style({}, 'node-type'),

  nodeChildren: style(
    {
      marginLeft: themeContract.px[16],
      borderLeft: `1px solid ${themeContract.colors.neutral4}`,
      paddingLeft: themeContract.px[8],
    },
    'node-children'
  ),
}
