import type { RecipeVariants } from '@another-graphql-ide/style'

import { Icon, type IconNames } from '../icon/icon'
import type { TooltipProps } from '../tooltip/tooltip'
import { Tooltip } from '../tooltip/tooltip'

import { iconButtonClass } from './icon-button.css'

type IconButtonVariants = RecipeVariants<typeof iconButtonClass>

export type IconButtonProps = IconButtonVariants & {
  action?: () => void
  /**
   * label used as aria-label
   */
  label: string
  name: IconNames
  ref?: React.Ref<HTMLButtonElement>
  tabIndex?: number
  tooltipOptions?: {
    side: TooltipProps['side']
  }
}

export const IconButton = ({
  tooltipOptions,
  ...restProps
}: IconButtonProps) => {
  if (tooltipOptions) {
    return (
      <Tooltip
        content={restProps.label}
        side={tooltipOptions.side}
        trigger={<Component {...restProps} />}
      />
    )
  } else {
    return <Component {...restProps} />
  }
}

const Component = ({
  action,
  ghost = false,
  name,
  ref,
  rotate,
  size = 'small',
  state,
  label,
  tabIndex = 0,
  ...props
}: IconButtonProps) => {
  return (
    <button
      {...props}
      className={iconButtonClass({
        ghost,
        rotate,
        size,
        state,
      })}
      aria-label={label}
      disabled={state === 'disabled'}
      onClick={action}
      ref={ref}
      tabIndex={tabIndex}
    >
      <Icon name={name} size={size === 'large' ? 'large' : 'medium'} />
    </button>
  )
}
