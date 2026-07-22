import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ReactElement, type ReactNode } from 'react'

import { IconButton } from '../icon-button/icon-button'

import { popoverStyles } from './popover.css'

export type PopoverProps = {
  content: ReactNode
  trigger: React.ReactNode
}

export const Popover = ({ content, trigger }: PopoverProps) => (
  <BasePopover.Root>
    <BasePopover.Trigger render={trigger as ReactElement} />
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={5}>
        <BasePopover.Popup className={popoverStyles.content}>
          <BasePopover.Close
            aria-label="Close"
            className={popoverStyles.close}
            nativeButton={false}
            render={
              <span>
                <IconButton
                  ghost={true}
                  label="Close schema view tree settings"
                  name="X"
                  size="mini"
                />
              </span>
            }
          />
          <BasePopover.Arrow className={popoverStyles.arrow} />
          {content}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  </BasePopover.Root>
)
