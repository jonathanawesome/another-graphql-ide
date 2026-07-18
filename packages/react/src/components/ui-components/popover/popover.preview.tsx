import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'
import { IconButton } from '../icon-button/icon-button'

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
              trigger={
                <IconButton
                  ghost={true}
                  label={'A cool popover'}
                  name={'Settings2'}
                />
              }
            />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
