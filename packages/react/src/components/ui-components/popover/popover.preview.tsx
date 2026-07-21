import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'
import { IconButton } from '../icon-button/icon-button'

import { Popover } from './popover'

export const nav: NavPath = 'UI Components/Popover'

export const Examples = createPreview(() => (
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
))
