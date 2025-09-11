import { RecipeVariants } from '@another-graphql-ide/style'

import { Icon } from '../icon/icon'
import { IconButton, IconButtonProps } from '../icon-button/icon-button'

import { appNavigationItemClass } from './app-navigation-item.css'

export type AppNavigationItemProps = {
  active: Pick<
    NonNullable<RecipeVariants<typeof appNavigationItemClass>>,
    'active'
  >['active']
  icon: IconButtonProps
  orientation: Pick<
    NonNullable<RecipeVariants<typeof appNavigationItemClass>>,
    'orientation'
  >['orientation']
  text: string
}

export const AppNavigationItem = ({
  active,
  icon,
  orientation,
  text,
}: AppNavigationItemProps) => {
  return (
    <div className={appNavigationItemClass({ active, orientation })}>
      {orientation === 'horizontal' ? (
        <Icon name={icon.iconName} />
      ) : (
        <IconButton {...icon} />
      )}
      {text}
    </div>
  )
}
