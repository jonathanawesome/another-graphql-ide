import * as RadixPopover from '@radix-ui/react-popover'
import { type ReactNode } from 'react'

import { type IconNames } from '../icon/icon'
import { IconButton } from '../icon-button/icon-button'

import { popoverStyles } from './popover.css'

export type PopoverProps = {
  content: ReactNode
  triggerLabel: string
  triggerIcon: IconNames
}

export const Popover = ({
  content,
  triggerIcon,
  triggerLabel,
}: PopoverProps) => (
  <RadixPopover.Root>
    <RadixPopover.Trigger>
      <IconButton
        aria-label={triggerLabel}
        ghost={true}
        name={triggerIcon}
        title={triggerLabel}
      />
    </RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content className={popoverStyles.content} sideOffset={5}>
        <RadixPopover.Close aria-label="Close" className={popoverStyles.close}>
          <IconButton
            ghost={true}
            name="X"
            size="mini"
            title="Close schema view tree settings"
          />
        </RadixPopover.Close>
        <RadixPopover.Arrow className={popoverStyles.arrow} />
        {content}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
)
