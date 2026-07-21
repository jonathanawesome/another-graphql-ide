import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Button } from './button'

export const nav: NavPath = 'UI Components/Button'

export const Examples = createPreview(() => (
  <DemoGrid>
    <DemoGrid>
      <DemoGridItem>
        <Button
          label="Execute operation"
          text="OperationName"
          withLeftIcon="Play"
        />
      </DemoGridItem>
    </DemoGrid>
  </DemoGrid>
))
