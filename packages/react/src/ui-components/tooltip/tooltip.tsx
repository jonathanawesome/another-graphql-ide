import * as RadixTooltip from '@radix-ui/react-tooltip'

import { tooltipStyles } from './tooltip.css'

export type TooltipProps = {
  content: string
  side?: RadixTooltip.TooltipContentProps['side']
  trigger: React.ReactNode
}

export const Tooltip = ({ content, side = 'top', trigger }: TooltipProps) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={0}>
        <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={tooltipStyles.content} side={side}>
            {content}
            <RadixTooltip.Arrow className={tooltipStyles.arrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
