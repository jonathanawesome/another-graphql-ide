import * as RadixPopover from '@radix-ui/react-popover'
import { type ReactNode } from 'react'

import { IconButton } from '../icon-button/icon-button'

import { popoverStyles } from './popover.css'

export type PopoverProps = {
  content: ReactNode
  trigger: React.ReactNode
}

export const Popover = ({ content, trigger }: PopoverProps) => (
  <RadixPopover.Root>
    <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content className={popoverStyles.content} sideOffset={5}>
        <RadixPopover.Close
          aria-label="Close"
          asChild
          className={popoverStyles.close}
        >
          <span>
            <IconButton
              ghost={true}
              label="Close schema view tree settings"
              name="X"
              size="mini"
            />
          </span>
        </RadixPopover.Close>
        <RadixPopover.Arrow className={popoverStyles.arrow} />
        {content}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
)
