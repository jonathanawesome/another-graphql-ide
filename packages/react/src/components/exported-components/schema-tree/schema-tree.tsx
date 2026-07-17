import { GraphQLSchema } from 'graphql'
import { useState } from 'react'

import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Input } from '../../ui-components/input/input'
import { Popover } from '../../ui-components/popover/popover'
import { Tabs } from '../../ui-components/tabs/tabs'

import { TreeContainer } from './components/tree-container'
import { useSchemaTree } from './hooks/use-schema-tree'
import { schemaTreeStyles } from './schema-tree.css'

export type SchemaTreeProps = {
  schema: GraphQLSchema
}

export const SchemaTree = ({ schema }: SchemaTreeProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Get data for all tabs
  const queryData = useSchemaTree(schema, searchTerm, 'query')
  const mutationData = useSchemaTree(schema, searchTerm, 'mutation')
  const subscriptionData = useSchemaTree(schema, searchTerm, 'subscription')
  const favoritesData = useSchemaTree(schema, searchTerm, 'favorites')

  // Create tab items with content
  const tabItems = []

  if (queryData.schemaData.query) {
    tabItems.push({
      name: 'query',
      content: queryData.tabData?.children ? (
        <TreeContainer nodes={queryData.tabData.children} />
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
        <TreeContainer nodes={mutationData.tabData.children} />
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
        <TreeContainer nodes={subscriptionData.tabData.children} />
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
      <TreeContainer nodes={favoritesData.tabData.children} />
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
            content={<>CONTENT</>}
            trigger={
              <IconButton
                ghost={true}
                label={'A cool popover'}
                name={'Settings2'}
              />
            }
          />
        </div>
      </div>

      <Tabs items={tabItems} label="Schema types" defaultActiveTab="query" />
    </div>
  )
}
