import { recipe, style, themeContract } from '@another-graphql-ide/style'

// The emphasized look shared by the hover state and the active (in-document)
// state, so a selected field reads the same as a hovered one.
const emphasizedName = {
  color: themeContract.colors.neutral8,
  fontVariationSettings: `"wght" 600`,
}

// Hoisted so the actions container can reveal on its hover/focus-within.
const listItemDetail = style(
  {
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[6],
    flex: 1,
  },
  'schema-tree-list-item-detail'
)

export const schemaTreeStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: themeContract.colors.neutral2,
      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.medium,
      overflow: 'hidden',
      height: '100%',
      // boxShadow: themeContract.shadows.tight,
    },
    'schema-tree-container'
  ),

  header: style(
    {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      height: themeContract.px[40],
      width: '100%',
      flex: 0,

      selectors: {
        '&::before': {
          content: '',
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 1,
          width: '100%',
          backgroundColor: themeContract.colors.neutral4,
          zIndex: 2,
        },
      },
    },
    'schema-tree-header'
  ),

  headerActionContainer: style(
    {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: themeContract.px[40],
      height: themeContract.px[40],
      flexShrink: 0,
      backgroundColor: themeContract.colors.neutral1,
      borderBottom: `1px solid ${themeContract.colors.neutral4}`,
      borderLeft: `1px solid ${themeContract.colors.neutral4}`,
    },
    'schema-tree-header-action-container'
  ),

  treeContainer: style(
    {
      flex: 1,
      height: '100%',
      overflow: 'auto',
      padding: themeContract.px[8],
    },
    'schema-tree-tree-container'
  ),

  emptyState: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeContract.px[32],
    color: themeContract.colors.neutral6,
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
    'schema-tree-tree-list'
  ),

  nestedList: style(
    {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      marginLeft: themeContract.px[20],
    },
    'schema-tree-nested-list'
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
    'schema-tree-list-item'
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
    'schema-tree-list-item-inner'
  ),

  listItemLeafIndicatorContainer: style(
    {
      height: themeContract.px[24],
      width: themeContract.px[24],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    'schema-tree-list-item-leaf-indicator-container'
  ),

  listItemDetail,

  listItemName: recipe(
    {
      base: {
        color: themeContract.colors.neutral7,
        cursor: 'pointer',
        fontVariationSettings: `"wght" 400`,
        transition: `all 0.1s ${themeContract.motion.authentic}`,

        ':hover': emphasizedName,
      },

      variants: {
        // A field currently present in the document reads like the hover state.
        active: {
          false: {},
          true: emphasizedName,
        },
      },
    },
    'schema-tree-list-item-name'
  ),

  // Button reset so a toggleable field name stays a native <button> (keyboard +
  // a11y) while looking exactly like the listItemName span. Compose with the
  // listItemName recipe class. Inherit font via longhands, not the `font`
  // shorthand, which would reset font-variation-settings to normal and wipe out
  // the "wght" 600 emphasis the active/hover state relies on.
  listItemNameButton: style(
    {
      appearance: 'none',
      background: 'none',
      border: 'none',
      margin: 0,
      padding: 0,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      textAlign: 'left',
    },
    'schema-tree-list-item-name-button'
  ),

  listItemArgumentsLabel: style(
    {
      color: themeContract.colors.neutral6,
      fontSize: themeContract.px[9],
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    'schema-tree-list-item-arguments-label'
  ),

  // Hidden by default; revealed on row hover or keyboard focus-within.
  listItemActionsContainer: style(
    {
      transition: `all .35s ${themeContract.motion.authentic}`,
      opacity: 0,
      visibility: 'hidden',
      selectors: {
        [`${listItemDetail}:hover &`]: { opacity: 1, visibility: 'visible' },
        [`${listItemDetail}:focus-within &`]: {
          opacity: 1,
          visibility: 'visible',
        },
      },
    },
    'schema-tree-list-item-name-actions-container'
  ),

  nodeType: style({}, 'schema-tree-node-type'),

  nodeChildren: style(
    {
      marginLeft: themeContract.px[16],
      borderLeft: `1px solid ${themeContract.colors.neutral4}`,
      paddingLeft: themeContract.px[8],
    },
    'schema-tree-node-children'
  ),
}
