import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { DocumentHeader } from './document-header'

const preview = createPreview({
  title: 'DocumentHeader',
  component: DocumentHeader,
  category: 'Panes',
  demos: [
    {
      name: 'Example',
      render: () => (
        <DemoGrid>
          <DocumentHeader />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
