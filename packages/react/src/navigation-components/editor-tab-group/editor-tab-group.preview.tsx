import { createPreview } from '@another-graphql-ide/shared'

import { EditorTabGroup } from './editor-tab-group'

const preview = createPreview({
  title: 'EditorTabGroup',
  component: EditorTabGroup,
  category: 'Navigation Components',
  demos: [
    {
      name: 'Example',
      render: () => <EditorTabGroup />,
    },
  ],
})

export default preview
