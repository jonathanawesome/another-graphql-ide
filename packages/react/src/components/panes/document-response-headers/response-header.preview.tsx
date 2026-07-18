import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { ResponseHeader } from './response-header'

const preview = createPreview({
  title: 'ResponseHeader',
  component: ResponseHeader,
  category: 'Panes',
  demos: [
    {
      name: 'Example',
      render: () => (
        <DemoGrid>
          <ResponseHeader />
        </DemoGrid>
      ),
    },
  ],
})

export default preview
