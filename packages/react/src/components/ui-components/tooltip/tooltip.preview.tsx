import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'
import { IconButton } from '../icon-button/icon-button'

import { Tooltip } from './tooltip'

export const nav: NavPath = 'UI Components/Tooltip'

export const Sides = createPreview(() => (
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
))
