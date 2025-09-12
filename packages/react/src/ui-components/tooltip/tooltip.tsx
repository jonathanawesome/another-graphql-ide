import * as RadixTooltip from '@radix-ui/react-tooltip'

import { type IconNames } from '../icon/icon'
import { IconButton } from '../icon-button/icon-button'

import { tooltipStyles } from './tooltip.css'

export type TooltipProps = {
  content: string
  triggerIcon: IconNames
  triggerLabel: string
}

export const Tooltip = ({
  content,
  triggerIcon,
  triggerLabel,
}: TooltipProps) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root open={true} delayDuration={100}>
        <RadixTooltip.Trigger>
          <IconButton
            aria-label={triggerLabel}
            ghost={true}
            name={triggerIcon}
            title={triggerLabel}
          />
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={tooltipStyles.content}>
            {content}
            <RadixTooltip.Arrow className={tooltipStyles.arrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
