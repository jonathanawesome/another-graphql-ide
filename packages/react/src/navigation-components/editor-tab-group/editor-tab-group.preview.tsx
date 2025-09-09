/* eslint-disable no-console */
import { createPreview } from '@another-graphql-ide/shared'

import { EditorTabGroup, type EditorTabGroupProps } from './editor-tab-group'

const preview = createPreview<EditorTabGroupProps>({
  title: 'EditorTabGroup',
  component: EditorTabGroup,
  category: 'Navigation Components',
  demos: [
    {
      name: 'Example',
      render: () => (
        <EditorTabGroup
          tabs={{
            tabs: [
              {
                actionIconButton: { iconName: 'X', title: 'Close Tab' },
                action: () => {
                  console.log('click')
                },
                active: true,
                text: 'OperationName',
              },
              {
                action: () => {
                  console.log('click')
                },
                text: 'Untitled',
              },
              {
                action: () => {
                  console.log('click')
                },
                text: 'Untitled2',
              },
            ],
          }}
        />
      ),
    },
  ],
})

export default preview
