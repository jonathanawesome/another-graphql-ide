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

  treeList: style(
    {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    'tree-list'
  ),

  nestedList: style(
    {
      margin: 0,
      padding: 0,
      listStyle: 'none',

      marginLeft: themeContract.px[20],
    },
    'nested-list'
  ),

  listItem: style(
    {
      position: 'relative',

      selectors: {
        '&::before': {
          content: '',
          position: 'absolute',
          top: 18,
          left: 12,
          height: 'calc(100% - 30px)',
          width: 1,
          backgroundColor: themeContract.colors.neutral5,
        },

        '&:last-of-type&::after': {
          content: '',
          position: 'absolute',
          zIndex: 1,
          top: 13,
          left: -8,
          height: 'calc(100% - 12px)',
          width: 1,
          backgroundColor: themeContract.colors.neutral2,
        },
      },
    },
    'list-item'
  ),

  listItemInner: recipe(
    {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: themeContract.px[4],
        position: 'relative',
      },

      variants: {
        withIndentLine: {
          false: {},
          true: {
            '::before': {
              content: '',
              position: 'absolute',
              top: 12,
              left: -8,
              height: 1,
              width: 12,
              backgroundColor: themeContract.colors.neutral5,
            },
          },
        },
      },
    },
    'list-item-inner'
  ),

  listItemLeafIndicatorContainer: style(
    {
      height: themeContract.px[24],
      width: themeContract.px[24],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    'list-item-leaf-indicator-container'
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
      fontVariationSettings: `"wght" 400`,
      transition: `all 0.3s ${themeContract.motion.authentic}`,

      ':hover': {
        color: themeContract.colors.textStrong,
        fontVariationSettings: `"wght" 600`,
      },
    },
    'list-item-name'
  ),

  listItemArgumentsLabel: style(
    {
      color: themeContract.colors.textLight,
      fontSize: themeContract.px[9],
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
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
