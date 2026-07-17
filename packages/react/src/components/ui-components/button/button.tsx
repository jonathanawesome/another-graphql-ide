import { RecipeVariants } from '@another-graphql-ide/style'

import { Icon, type IconNames } from '../icon/icon'
import { Tooltip, TooltipProps } from '../tooltip/tooltip'

import { buttonClass } from './button.css'

type ButtonVariants = RecipeVariants<typeof buttonClass>

export type ButtonProps = ButtonVariants & {
  action?: () => void
  /**
   * label used as aria-label
   */
  label: string
  ref?: React.Ref<HTMLButtonElement>
  text: string
  /**
   * if passed will utitize a tooltip with these settings
   */
  tooltipOptions?: {
    side: TooltipProps['side']
  }
  /**
   * if passed will include a mini icon on the left
   */
  withLeftIcon?: IconNames
}

export const Button = ({ tooltipOptions, ...restProps }: ButtonProps) => {
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
  label,
  ref,
  state,
  text,
  withLeftIcon,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={buttonClass({
        state,
      })}
      aria-label={label}
      disabled={state === 'disabled'}
      onClick={action}
      ref={ref}
      {...props}
    >
      {withLeftIcon && <Icon name={withLeftIcon} size={'small'} />}
      {text}
    </button>
  )
}
