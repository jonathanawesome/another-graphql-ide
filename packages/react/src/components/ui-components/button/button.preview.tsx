import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Button, type ButtonProps } from './button'

const preview = createPreview<ButtonProps>({
  title: 'Button',
  component: Button,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
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
      ),
    },
  ],
})

export default preview
