import { createPreview } from '@another-graphql-ide/shared'

import { DemoGrid } from '../../utility-components/previews/components'

import { Separator, type SeparatorProps } from './separator'

const preview = createPreview<SeparatorProps>({
  title: 'Separator',
  component: Separator,
  category: 'UI Components',
  variants: [
    {
      name: 'Vertical',
      props: { orientation: 'vertical' },
    },
    {
      name: 'Horizontal',
      props: { orientation: 'horizontal' },
    },
  ],
  demos: [
    {
      name: 'Vertical & Horizontal',
      render: () => (
        <DemoGrid>
          <div style={{ height: 200, width: 200 }}>
            <Separator orientation="horizontal" />
            <Separator orientation="vertical" />
          </div>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
