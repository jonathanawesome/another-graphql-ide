import { useMemo, useState } from 'react'

import { useShortcut } from '../../../keyboard'
import { useAppStore } from '../../../state'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Input } from '../../ui-components/input/input'
import { Popover } from '../../ui-components/popover/popover'
import { Tabs } from '../../ui-components/tabs/tabs'

import { SettingsContent } from './components/settings-content'
import { TreeContainer } from './components/tree-container'
import { useSchemaTree } from './hooks/use-schema-tree'
import { useTreeExpansion } from './hooks/use-tree-expansion'
import { schemaTreeStyles } from './schema-tree.css'
import { activeOperationType, computePresentPaths } from './utils/present-paths'
import { flattenTree, type TabType } from './utils/tree-utils'

const TAB_TYPES = ['query', 'mutation', 'subscription', 'favorites'] as const

/** The tab selection can come from a manual click, so narrow it back. */
const asTabType = (value: string | null | undefined): TabType =>
  TAB_TYPES.includes(value as TabType) ? (value as TabType) : 'query'

export const SchemaTree = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const toggleField = useAppStore.use.toggleField()
  const showFieldTypes = useAppStore.use.showFieldTypes()
  const toggleShowFieldTypes = useAppStore.use.toggleShowFieldTypes()
  const toggleInsertionMode = useAppStore.use.toggleObjectFieldInsertionMode()
  const activeSchema = useAppStore.use.schema()
  const query = useAppStore.use.query()
  const cursor = useAppStore.use.cursor()

  // Field/argument paths in the active operation, so only what you are editing
  // reads as active in the tree.
  const activePaths = useMemo(
    () => computePresentPaths(query, cursor),
    [query, cursor]
  )

  // Follow the active operation with the tab selection. A manual tab change
  // persists until the active operation's type changes, at which point we clear
  // the override (adjusting state during render, per the React docs).
  const activeOpType = useMemo(
    () => activeOperationType(query, cursor),
    [query, cursor]
  )
  const [manualTab, setManualTab] = useState<string | null>(null)
  const [seenOpType, setSeenOpType] = useState(activeOpType)
  if (activeOpType !== seenOpType) {
    setSeenOpType(activeOpType)
    setManualTab(null)
  }
  const activeTab = asTabType(manualTab ?? activeOpType)

  const { roots, visibleRoots, fieldCounts, getChildren } = useSchemaTree(
    activeSchema,
    searchTerm
  )
  const { expanded, toggleExpanded } = useTreeExpansion(activeSchema)

  // Registered once for the whole brick. The bus is page-global, so with
  // several trees mounted only the newest responds.
  useShortcut('schema-tree.toggle-field-types', toggleShowFieldTypes)
  useShortcut('schema-tree.toggle-insertion-mode', toggleInsertionMode)

  // Rows for the visible tab only. Base UI keeps every tab panel mounted, so
  // each one that renders the tree mounts its own virtualizer.
  const rows = useMemo(
    () => flattenTree(visibleRoots[activeTab], expanded, getChildren),
    [visibleRoots, activeTab, expanded, getChildren]
  )

  if (!activeSchema) {
    return (
      <div className={schemaTreeStyles.container}>
        <div className={schemaTreeStyles.emptyState}>No schema loaded.</div>
      </div>
    )
  }

  // The tree for whichever tab is showing. Inactive panels render nothing.
  const tree = (
    <TreeContainer
      rows={rows}
      onToggle={toggleField}
      onToggleExpand={toggleExpanded}
      showTypes={showFieldTypes}
      activePaths={activePaths}
    />
  )

  // Create tab items with content
  const tabItems = []

  if (roots.query) {
    tabItems.push({
      name: 'query',
      content: activeTab === 'query' ? tree : null,
      trigger: {
        text: 'Query',
        pill:
          fieldCounts.query > 0
            ? { text: fieldCounts.query.toString() }
            : undefined,
      },
    })
  }

  if (roots.mutation) {
    tabItems.push({
      name: 'mutation',
      content: activeTab === 'mutation' ? tree : null,
      trigger: {
        text: 'Mutation',
        pill:
          fieldCounts.mutation > 0
            ? { text: fieldCounts.mutation.toString() }
            : undefined,
      },
    })
  }

  if (roots.subscription) {
    tabItems.push({
      name: 'subscription',
      content: activeTab === 'subscription' ? tree : null,
      trigger: {
        text: 'Subscription',
        pill:
          fieldCounts.subscription > 0
            ? { text: fieldCounts.subscription.toString() }
            : undefined,
      },
    })
  }

  // Add favorites tab
  tabItems.push({
    name: 'favorites',
    content:
      activeTab === 'favorites' ? (
        <div className={schemaTreeStyles.emptyState}>
          No favorites yet. Click on fields to add them to your favorites.
        </div>
      ) : null,
    trigger: {
      text: 'Favorites',
    },
  })

  return (
    <div className={schemaTreeStyles.container}>
      <div className={schemaTreeStyles.header}>
        <Input
          handleChange={e => setSearchTerm(e.target.value)}
          leftIcon="Search"
          name="Search schema..."
          placeholder="Search schema..."
          value={searchTerm}
          withClearValue
        />
        <div className={schemaTreeStyles.headerActionContainer}>
          <Popover
            content={<SettingsContent />}
            trigger={
              <IconButton
                ghost={true}
                label={'Schema tree settings'}
                name={'Settings2'}
              />
            }
          />
        </div>
      </div>

      <Tabs
        items={tabItems}
        label="Schema types"
        value={activeTab}
        onValueChange={setManualTab}
      />
    </div>
  )
}
