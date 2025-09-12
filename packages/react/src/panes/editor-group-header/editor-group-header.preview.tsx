import { createPreview } from '@another-graphql-ide/shared'

import { IconButtonGroup } from '../../ui-components/icon-button-group/icon-button-group'
import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import {
  EditorGroupHeader,
  type EditorGroupHeaderProps,
} from './editor-group-header'

const preview = createPreview<EditorGroupHeaderProps>({
  title: 'EditorGroupHeader',
  component: EditorGroupHeader,
  category: 'Panes',
  demos: [
    {
      name: 'Example',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <EditorGroupHeader
              controlGroup={
                <IconButtonGroup
                  icons={[
                    {
                      name: 'BookOpenText',
                      size: 'mini',
                      title: 'BookOpenText',
                    },
                    { name: 'Caret', size: 'mini', title: 'Caret' },
                    { name: 'Combine', size: 'mini', title: 'Combine' },
                    { name: 'Settings2', size: 'mini', title: 'Settings2' },
                  ]}
                />
              }
              title={'Document'}
              variant="document"
            />
          </DemoGridItem>
          <DemoGridItem>
            <EditorGroupHeader
              controlGroup={
                <IconButtonGroup
                  icons={[
                    {
                      name: 'Copy',
                      size: 'mini',
                      title: 'Copy',
                    },
                  ]}
                />
              }
              title={'Response'}
              variant="response"
            />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
