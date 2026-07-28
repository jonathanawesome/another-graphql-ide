import type { IconButtonProps } from '../icon-button/icon-button'
import { IconButton } from '../icon-button/icon-button'

import { iconButtonGroupClass } from './icon-button-group.css'

export type IconButtonGroupProps = { icons: Omit<IconButtonProps, 'ghost'>[] }

export const IconButtonGroup = ({ icons }: IconButtonGroupProps) => {
  return (
    <div className={iconButtonGroupClass}>
      {icons.map((props, i) => {
        return <IconButton key={i} {...props} ghost={true} />
      })}
    </div>
  )
}
