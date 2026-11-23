import {
  recipe,
  style,
  textStyles,
  themeContract,
} from '@another-graphql-ide/style'

// The emphasized look shared by the hover state and the active (in-document)
// state, so a selected field reads the same as a hovered one.
const emphasizedName = {
  color: themeContract.text.primary,
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
      backgroundColor: themeContract.bg.surface,
      border: `1px solid ${themeContract.border.subtle}`,
      borderRadius: themeContract.radii.md,
      overflow: 'hidden',
      height: '100%',
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
          backgroundColor: themeContract.border.subtle,
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
      borderBottom: `1px solid ${themeContract.border.subtle}`,
      borderLeft: `1px solid ${themeContract.border.subtle}`,
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
    ...textStyles.bodyDense,
    color: themeContract.text.secondary,
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

  listItem: style(
    {
      position: 'relative',
      // The row is the tree's focus target, so keyboard focus has to be visible
      // on it and not only on the controls inside it.
      outline: 'none',
      borderRadius: themeContract.radii.sm,

      selectors: {
        '&:focus-visible': {
          outline: `2px solid ${themeContract.focus.ring}`,
          outlineOffset: -1,
        },
      },
    },
    'schema-tree-list-item'
  ),

  // One rail per ancestor column, drawn per row now that the tree is a flat
  // list: full height while that group continues, a stub on the row it ends at.
  // Nested markup used to get this from a single ::before spanning the subtree.
  listItemGuide: recipe(
    {
      base: {
        content: '',
        position: 'absolute',
        top: 0,
        width: 1,
        backgroundColor: themeContract.border.default,
      },

      variants: {
        continues: {
          true: { bottom: 0 },
          // Meets the horizontal tick drawn by listItemInner.
          false: { height: 12 },
        },
      },
    },
    'schema-tree-list-item-guide'
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
              backgroundColor: themeContract.border.default,
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
        color: themeContract.text.secondary,
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

  // Mono, smaller, and dimmer than the field name: three ways of staying
  // subordinate to it, since the name is what a user scans for.
  listItemTypeLabel: style(
    {
      fontFamily: themeContract.fonts.mono,
      fontSize: themeContract.px[11],
      color: themeContract.text.tertiary,
      whiteSpace: 'nowrap',
      // Sits outside the name button, so it is never part of the click target.
      pointerEvents: 'none',
    },
    'schema-tree-list-item-type-label'
  ),

  listItemArgumentsLabel: style(
    {
      color: themeContract.text.tertiary,
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
}
