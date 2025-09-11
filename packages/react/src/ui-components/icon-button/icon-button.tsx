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
  ghost = false,
  iconName,
  isDisabled = false,
  rotate,
  size = 'small',
  state,
  title,
}: IconButtonProps) => {
  return (
    <button
      className={iconButtonClass({
        ghost,
        isDisabled,
        rotate,
        size,
        state,
      })}
      aria-label={title}
      disabled={isDisabled}
      onClick={action}
      title={title}
    >
      <Icon name={iconName} size={size === 'large' ? 'large' : 'medium'} />
    </button>
  )
}
