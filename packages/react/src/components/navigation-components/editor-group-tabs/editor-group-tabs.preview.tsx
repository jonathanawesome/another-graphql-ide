import { createPreview } from '@another-graphql-ide/shared'

import { EditorGroupTabs } from './editor-group-tabs'

const preview = createPreview({
  title: 'EditorGroupTabs',
  component: EditorGroupTabs,
  category: 'Navigation Components',
  demos: [
    {
      name: 'Example',
      render: () => <EditorGroupTabs />,
    },
  ],
})

export default preview
