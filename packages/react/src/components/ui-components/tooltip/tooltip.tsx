import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement } from 'react'

import { tooltipStyles } from './tooltip.css'

export type TooltipProps = {
  /**
   * Usually a string. Wider so a tooltip can advertise a shortcut beside its
   * label, which is the natural second home for `Kbd` after the settings panel:
   *
   * ```tsx
   * content={<>Toggle return types <Kbd shortcut={id} tone="inverted" /></>}
   * ```
   *
   * The popup is a dark surface, hence the inverted tone.
   */
  content: React.ReactNode
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
