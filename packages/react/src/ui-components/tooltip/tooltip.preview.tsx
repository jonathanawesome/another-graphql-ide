import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Tooltip, type TooltipProps } from './tooltip'

const preview = createPreview<TooltipProps>({
  title: 'Tooltip',
  component: Tooltip,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid gap={64}>
          <DemoGridItem>
            <Tooltip
              content="213"
              triggerIcon="Settings2"
              triggerLabel="A cool popover"
            />
          </DemoGridItem>
          <DemoGridItem>
            <Tooltip
              content="243637"
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
