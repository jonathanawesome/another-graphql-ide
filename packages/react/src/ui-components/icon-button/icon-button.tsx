import { RecipeVariants } from '@another-graphql-ide/style'

import { Icon, type IconNames } from '../icon/icon'

import { iconButtonClass } from './icon-button.css'

type IconButtonVariants = RecipeVariants<typeof iconButtonClass>

export type IconButtonProps = IconButtonVariants & {
  action?: () => void
  iconName: IconNames
  title: string
}

export const IconButton = ({
  action,
  iconName,
  state,
  isDisabled = false,
  rotate,
  size = 'small',
  title,
}: IconButtonProps) => {
  return (
    <button
      className={iconButtonClass({
        isDisabled,
        rotate,
        state,
        size,
      })}
      aria-label={title}
      disabled={isDisabled}
      onClick={action}
      title={title}
    >
      <Icon name={iconName} size={size === 'large' ? 'medium' : 'small'} />
    </button>
  )
}
