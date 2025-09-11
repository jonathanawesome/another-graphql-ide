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
      name: 'All',
      render: () => (
        <DemoGrid>
          <DemoGrid>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={true}
                size="large"
                title="BowArrow"
              />
              <span>large</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={true}
                size="medium"
                title="BowArrow"
              />
              <span>medium</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={true}
                size="small"
                title="BowArrow"
              />
              <span>small</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={true}
                size="mini"
                title="BowArrow"
              />
              <span>mini</span>
            </DemoGridItem>
          </DemoGrid>
          <DemoGrid>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={false}
                size="large"
                title="BowArrow"
              />
              <span>large</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={false}
                size="medium"
                title="BowArrow"
              />
              <span>medium</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={false}
                size="small"
                title="BowArrow"
              />
              <span>small</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                iconName="BowArrow"
                ghost={false}
                size="mini"
                title="BowArrow"
              />
              <span>mini</span>
            </DemoGridItem>
          </DemoGrid>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
