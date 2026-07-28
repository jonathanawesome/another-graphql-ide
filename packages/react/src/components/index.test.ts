import { describe, expect, it } from 'vitest'

/**
 * The public surface is this change's deliverable, and nothing else imports
 * through these barrels: previews and tests all use deep paths, and the package
 * ships raw source, so a dropped export fails no typecheck and no build.
 */
describe('public exports', () => {
  it('exports the documented components', async () => {
    const components = await import('./index')

    expect(Object.keys(components).sort()).toEqual([
      'Button',
      'ConnectionBar',
      'DocumentPane',
      'Editor',
      'EditorGroup',
      'Icon',
      'Popover',
      'Resizer',
      'ResponsePane',
      'RunControl',
      'SchemaTree',
      'VariablesEditor',
    ])
  })

  it('exports the recipes', async () => {
    const recipes = await import('../recipes/index')

    expect(Object.keys(recipes).sort()).toEqual(['DocsEditor', 'RunButton'])
  })

  it('exports the state entrypoint', async () => {
    const state = await import('../state/index')

    expect(Object.keys(state).sort()).toEqual([
      'AGIProvider',
      'AGIStoreContext',
      'LOCAL_ENDPOINT',
      'useAGIStore',
      'useAppStore',
      'useOperation',
    ])
  })

  // Resolved through the package's own exports map, so a broken subpath is
  // caught here rather than by a consumer.
  it('resolves the published subpaths', async () => {
    await expect(
      import('@another-graphql-ide/react/state')
    ).resolves.toBeDefined()
    await expect(
      import('@another-graphql-ide/react/components')
    ).resolves.toBeDefined()
    await expect(
      import('@another-graphql-ide/react/recipes')
    ).resolves.toBeDefined()
  })
})
