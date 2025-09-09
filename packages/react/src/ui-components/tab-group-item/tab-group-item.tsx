import { RecipeVariants } from '@another-graphql-ide/style'

import { IconButton, IconButtonProps } from '../icon-button/icon-button'
import { Pill, PillProps } from '../pill/pill'

import { tabGroupItemStyles } from './tab-group-item.css'

export type TabGroupItemProps = {
  action: () => void
  actionIconButton?: IconButtonProps
  active?: Pick<
    NonNullable<RecipeVariants<typeof tabGroupItemStyles.container>>,
    'active'
  >['active']
  pill?: PillProps
  text: string
}

export const TabGroupItem = ({
  action,
  actionIconButton,
  active = false,
  pill,
  text,
}: TabGroupItemProps) => {
  return (
    <div
      className={tabGroupItemStyles.container({
        active,
        withActionIcon: actionIconButton && true,
      })}
    >
      <button className={tabGroupItemStyles.button} onClick={action}>
        {text}
        {pill && <Pill {...pill} />}
      </button>
      {actionIconButton && <IconButton {...actionIconButton} />}
    </div>
  )
}
