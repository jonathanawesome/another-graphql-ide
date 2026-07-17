import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'
import { IconButton } from '../icon-button/icon-button'

import { Tooltip, type TooltipProps } from './tooltip'

const preview = createPreview<TooltipProps>({
  title: 'Tooltip',
  component: Tooltip,
  category: 'UI Components',
  demos: [
    {
      name: 'Sides',
      render: () => (
        <DemoGrid gap={64}>
          <DemoGridItem>
            <Tooltip
              content={'This is a cool tooltip'}
              side="top"
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
