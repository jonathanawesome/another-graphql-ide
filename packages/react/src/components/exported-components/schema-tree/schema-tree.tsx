import type { GraphQLSchema } from 'graphql'
import { useEffect, useMemo, useState } from 'react'

import { useAppStore } from '../../../state'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Input } from '../../ui-components/input/input'
import { Popover } from '../../ui-components/popover/popover'
import { Tabs } from '../../ui-components/tabs/tabs'

import { SettingsContent } from './components/settings-content'
import { TreeContainer } from './components/tree-container'
import { useSchemaTree } from './hooks/use-schema-tree'
import { schemaTreeStyles } from './schema-tree.css'
import {
  activeOperationType,
  computePresentPaths,
} from './utils/present-paths'

export type SchemaTreeProps = {
  /**
   * Optional schema to seed shared state with. When omitted, the tree reads the
   * schema another brick (e.g. EditorGroup) placed in the store.
   */
  schema?: GraphQLSchema
}

export const SchemaTree = ({ schema }: SchemaTreeProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const setSchema = useAppStore.use.setSchema()
  const toggleField = useAppStore.use.toggleField()
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
  const activeTab = manualTab ?? activeOpType ?? 'query'

  // Bridge the optional seed prop into shared state.
  useEffect(() => {
    if (schema) setSchema(schema)
  }, [schema, setSchema])

  // Get data for all tabs
  const queryData = useSchemaTree(activeSchema, searchTerm, 'query')
  const mutationData = useSchemaTree(activeSchema, searchTerm, 'mutation')
  const subscriptionData = useSchemaTree(
    activeSchema,
    searchTerm,
    'subscription'
  )
  const favoritesData = useSchemaTree(activeSchema, searchTerm, 'favorites')

  if (!activeSchema) {
    return (
      <div className={schemaTreeStyles.container}>
        <div className={schemaTreeStyles.emptyState}>No schema loaded.</div>
      </div>
    )
  }

  // Create tab items with content
  const tabItems = []

  if (queryData.schemaData.query) {
    tabItems.push({
      name: 'query',
      content: queryData.tabData?.children ? (
        <TreeContainer
          nodes={queryData.tabData.children}
          onToggle={toggleField}
          activePaths={activePaths}
        />
      ) : null,
      trigger: {
        text: 'Query',
        pill:
          queryData.fieldCounts.query > 0
            ? { text: queryData.fieldCounts.query.toString() }
            : undefined,
      },
    })
  }

  if (mutationData.schemaData.mutation) {
    tabItems.push({
      name: 'mutation',
      content: mutationData.tabData?.children ? (
        <TreeContainer
          nodes={mutationData.tabData.children}
          onToggle={toggleField}
          activePaths={activePaths}
        />
      ) : null,
      trigger: {
        text: 'Mutation',
        pill:
          mutationData.fieldCounts.mutation > 0
            ? { text: mutationData.fieldCounts.mutation.toString() }
            : undefined,
      },
    })
  }

  if (subscriptionData.schemaData.subscription) {
    tabItems.push({
      name: 'subscription',
      content: subscriptionData.tabData?.children ? (
        <TreeContainer
          nodes={subscriptionData.tabData.children}
          onToggle={toggleField}
          activePaths={activePaths}
        />
      ) : null,
      trigger: {
        text: 'Subscription',
        pill:
          subscriptionData.fieldCounts.subscription > 0
            ? { text: subscriptionData.fieldCounts.subscription.toString() }
            : undefined,
      },
    })
  }

  // Add favorites tab
  tabItems.push({
    name: 'favorites',
    content: favoritesData.tabData?.children ? (
      <TreeContainer
        nodes={favoritesData.tabData.children}
        onToggle={toggleField}
        activePaths={activePaths}
      />
    ) : (
      <div className={schemaTreeStyles.emptyState}>
        No favorites yet. Click on fields to add them to your favorites.
      </div>
    ),
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
