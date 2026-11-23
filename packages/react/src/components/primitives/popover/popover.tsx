import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ReactElement, type ReactNode } from 'react'

import { IconButton } from '../icon-button/icon-button'

import { popoverStyles } from './popover.css'

export type PopoverProps = {
  content: ReactNode
  trigger: React.ReactNode
  /** Controlled open state. Leave unset for the uncontrolled default. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover = ({
  content,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
}: PopoverProps) => (
  <BasePopover.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    <BasePopover.Trigger render={trigger as ReactElement} />
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={5}>
        <BasePopover.Popup className={popoverStyles.content}>
          {/* Close renders straight into the IconButton, so there is one
              labeled control rather than a labeled span wrapping one. The
              wrapper carries the positioning IconButton would overwrite. */}
          <div className={popoverStyles.close}>
            <BasePopover.Close
              render={
                <IconButton ghost={true} label="Close" name="X" size="mini" />
              }
            />
          </div>
          <BasePopover.Arrow className={popoverStyles.arrow} />
          {content}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  </BasePopover.Root>
)
