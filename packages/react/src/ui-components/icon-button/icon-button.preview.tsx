import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { IconButton, type IconButtonProps } from './icon-button'

const preview = createPreview<IconButtonProps>({
  title: 'IconButton',
  component: IconButton,
  category: 'UI Components',
  variants: [
    {
      name: 'default',
      props: { iconName: 'BowArrow', title: 'BowArrow' },
    },
    {
      name: 'active',
      props: { iconName: 'BowArrow', title: 'BowArrow', state: 'active' },
    },
    {
      name: 'highlight',
      props: { iconName: 'BowArrow', title: 'BowArrow', state: 'highlight' },
    },
  ],
  demos: [
    {
      name: 'Sizes',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <IconButton iconName="BowArrow" title="BowArrow" size="large" />
            <span>large</span>
          </DemoGridItem>
          <DemoGridItem>
            <IconButton iconName="BowArrow" title="BowArrow" size="medium" />
            <span>medium</span>
          </DemoGridItem>
          <DemoGridItem>
            <IconButton iconName="BowArrow" title="BowArrow" size="small" />
            <span>small</span>
          </DemoGridItem>
          <DemoGridItem>
            <IconButton iconName="BowArrow" title="BowArrow" size="mini" />
            <span>mini</span>
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
