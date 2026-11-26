import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'react-foundry'

export default defineConfig({
  // Previews live in the react library package, not here.
  previews: '../../packages/react/src/**/*.preview.tsx',
  // Pin the generated NavPath types into the previews' own TS project so a bad
  // nav string is a compile error where previews are authored.
  navTypesPath: '../../packages/react/src/foundry-nav.gen.d.ts',
  title: 'another-graphql-ide',
  nav: [
    {
      label: 'Layouts',
      children: [
        { label: 'Full IDE' },
        { label: 'Explorer + Editor' },
        { label: 'Embedded Playground' },
        { label: 'Docs Page' },
        { label: 'Split Instance' },
        { label: 'Side by Side' },
        { label: 'Tutorial Steps' },
        { label: 'IDE in a Drawer' },
        { label: 'Schema Reference' },
        { label: 'Custom Brick' },
        { label: 'Custom Result View' },
        { label: 'Narrow' },
        { label: 'Host Theming' },
      ],
    },
    {
      label: 'Recipes',
      children: [{ label: 'Docs Editor' }, { label: 'Run Button' }],
    },
    {
      label: 'Bricks',
      children: [
        { label: 'Connection Bar' },
        { label: 'Editor' },
        { label: 'Editor Group' },
        { label: 'Headers Editor' },
        { label: 'JSON Editor' },
        { label: 'Schema Tree' },
        { label: 'Schema Tree Settings' },
        { label: 'SDL Diff' },
        { label: 'SDL Editor' },
        { label: 'SDL Viewer' },
        { label: 'Variables Editor' },
      ],
    },
    {
      label: 'Panes',
      children: [{ label: 'Document Header' }, { label: 'Response Header' }],
    },
    {
      label: 'Primitives',
      children: [
        { label: 'App Navigation Item' },
        { label: 'Button' },
        { label: 'Icon' },
        { label: 'Icon Button' },
        { label: 'Icon Button Group' },
        { label: 'Input' },
        { label: 'Kbd' },
        { label: 'Pill' },
        { label: 'Popover' },
        { label: 'Resizer' },
        { label: 'Run Control' },
        { label: 'Separator' },
        { label: 'Tabs' },
        { label: 'Tooltip' },
      ],
    },
    {
      label: 'Chrome',
      children: [{ label: 'App Navigation' }, { label: 'Editor Group Tabs' }],
    },
  ],
  viteConfig: {
    // The GitHub Pages project site serves from a sub-path
    // (<user>.github.io/another-graphql-ide/), so the Pages build sets
    // PAGES_BASE. Dev and normal builds stay at the root so localhost is
    // http://localhost:5173/, not /another-graphql-ide/.
    base: process.env.PAGES_BASE ?? '/',
    // Our components author styles with vanilla-extract (.css.ts); foundry does
    // not bundle the plugin. Symlinked workspace sources are served automatically
    // (foundry allow-lists the detected workspace root).
    plugins: [vanillaExtractPlugin()],
  },
})
