import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Pill, type PillProps } from './pill'

const preview = createPreview<PillProps>({
  title: 'Pill',
  component: Pill,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Pill text="213" />
          </DemoGridItem>
          <DemoGridItem>
            <Pill text="243637" />
          </DemoGridItem>
          <DemoGridItem>
            <Pill text="Some Cool Pill" />
          </DemoGridItem>
          <DemoGridItem>
            <Pill text="987" />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
