import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Input, type InputProps } from './input'

const preview = createPreview<InputProps>({
  title: 'Input',
  component: Input,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Input text="213" />
          </DemoGridItem>
          <DemoGridItem>
            <Input text="243637" />
          </DemoGridItem>
          <DemoGridItem>
            <Input text="Some Cool Input" />
          </DemoGridItem>
          <DemoGridItem>
            <Input text="987" />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
