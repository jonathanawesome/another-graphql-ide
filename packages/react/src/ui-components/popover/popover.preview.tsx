import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Popover, type PopoverProps } from './popover'

const preview = createPreview<PopoverProps>({
  title: 'Popover',
  component: Popover,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Popover
              content={<>content</>}
              triggerIcon="Settings2"
              triggerLabel="A cool popover"
            />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
