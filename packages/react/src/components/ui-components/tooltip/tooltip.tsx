import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement } from 'react'

import { tooltipStyles } from './tooltip.css'

export type TooltipProps = {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  trigger: React.ReactNode
}

export const Tooltip = ({ content, side = 'top', trigger }: TooltipProps) => {
  return (
    <BaseTooltip.Provider delay={0}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={trigger as ReactElement} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side}>
            <BaseTooltip.Popup className={tooltipStyles.content}>
              {content}
              <BaseTooltip.Arrow className={tooltipStyles.arrow} />
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
