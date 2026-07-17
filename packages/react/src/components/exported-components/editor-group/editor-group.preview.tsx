import { createPreview } from '@another-graphql-ide/shared'

import { EditorGroup, type EditorGroupProps } from './editor-group'

const preview = createPreview<EditorGroupProps>({
  title: 'EditorGroup',
  component: EditorGroup,
  category: 'Exported Components',
  demos: [
    {
      name: 'Example',
      render: () => <EditorGroup something={'something'} />,
    },
  ],
})

export default preview
