import { RecipeVariants } from '@another-graphql-ide/style'

import { IconButton, IconButtonProps } from '../icon-button/icon-button'
import { Pill, PillProps } from '../pill/pill'

import { tabGroupItemClass } from './tab-group-item.css'

export type TabGroupItemProps = {
  action: () => void
  actionIconButton?: IconButtonProps
  active?: Pick<
    NonNullable<RecipeVariants<typeof tabGroupItemClass>>,
    'active'
  >['active']
  text: string
  pill?: PillProps
}

export const TabGroupItem = ({
  action,
  actionIconButton,
  active = false,
  text,
  pill,
}: TabGroupItemProps) => {
  return (
    <button className={tabGroupItemClass({ active })} onClick={action}>
      {text}
      {pill && <Pill {...pill} />}
      {actionIconButton && <IconButton {...actionIconButton} />}
    </button>
  )
}
