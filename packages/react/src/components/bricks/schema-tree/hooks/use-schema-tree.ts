import type { GraphQLSchema } from 'graphql'
import { useMemo } from 'react'

import { createChildrenCache } from '../utils/children-cache'
import { createSchemaTreeData, type TreeNode } from '../utils/tree-utils'

const NO_ROOTS = { query: null, mutation: null, subscription: null }

/**
 * Schema tree data for every tab, built once per schema.
 *
 * Roots describe themselves only; `getChildren` derives and caches one level at
 * a time, so the cost of a schema is what the user opens rather than the size
 * of its type graph.
 */
export function useSchemaTree(
  schema: GraphQLSchema | undefined,
  searchTerm: string
) {
  // The cache is created alongside the roots so it dies with them.
  const { roots, getChildren } = useMemo(
    () => ({
      roots: schema ? createSchemaTreeData(schema) : NO_ROOTS,
      getChildren: createChildrenCache(),
    }),
    [schema]
  )

  const rootChildren = useMemo(
    () => ({
      query: roots.query ? getChildren(roots.query) : [],
      mutation: roots.mutation ? getChildren(roots.mutation) : [],
      subscription: roots.subscription ? getChildren(roots.subscription) : [],
      favorites: [] as TreeNode[], // TODO: implement favorites
    }),
    [roots, getChildren]
  )

  // Search filters root fields only, as it did before the tree went lazy.
  const visibleRoots = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return rootChildren

    const matching = (nodes: TreeNode[]) =>
      nodes.filter(node => node.name.toLowerCase().includes(term))

    return {
      query: matching(rootChildren.query),
      mutation: matching(rootChildren.mutation),
      subscription: matching(rootChildren.subscription),
      favorites: matching(rootChildren.favorites),
    }
  }, [rootChildren, searchTerm])

  const fieldCounts = useMemo(
    () => ({
      query: visibleRoots.query.length,
      mutation: visibleRoots.mutation.length,
      subscription: visibleRoots.subscription.length,
    }),
    [visibleRoots]
  )

  return { roots, visibleRoots, fieldCounts, getChildren }
}
