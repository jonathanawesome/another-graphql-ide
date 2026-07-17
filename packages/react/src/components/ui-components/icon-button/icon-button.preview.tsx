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
      props: { name: 'BowArrow', label: 'BowArrow' },
    },
    {
      name: 'active',
      props: { name: 'BowArrow', label: 'BowArrow', state: 'active' },
    },
    {
      name: 'highlight',
      props: { name: 'BowArrow', label: 'BowArrow', state: 'highlight' },
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
                ghost={true}
                label="BowArrow ghost"
                name="BowArrow"
                size="large"
              />
              <span>large - ghost</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={true}
                label="BowArrow ghost"
                name="BowArrow"
                size="medium"
              />
              <span>medium - ghost</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={true}
                label="BowArrow ghost"
                name="BowArrow"
                size="small"
              />
              <span>small - ghost</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={true}
                label="BowArrow ghost"
                name="BowArrow"
                size="mini"
              />
              <span>mini - ghost</span>
            </DemoGridItem>
          </DemoGrid>
          <DemoGrid>
            <DemoGridItem>
              <IconButton
                ghost={false}
                label="BowArrow"
                name="BowArrow"
                size="large"
              />
              <span>large</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={false}
                label="BowArrow"
                name="BowArrow"
                size="medium"
              />
              <span>medium</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={false}
                label="BowArrow"
                name="BowArrow"
                size="small"
              />
              <span>small</span>
            </DemoGridItem>
            <DemoGridItem>
              <IconButton
                ghost={false}
                label="BowArrow"
                name="BowArrow"
                size="mini"
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
