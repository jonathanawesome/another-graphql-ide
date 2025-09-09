import { RecipeVariants } from '@another-graphql-ide/style'

import { IconButton, IconButtonProps } from '../icon-button/icon-button'
import { Pill, PillProps } from '../pill/pill'

import { tabGroupItemClass } from './tab-group-item.css'

export type TabGroupItemProps = {
  actionIconButton?: IconButtonProps
  active: Pick<
    NonNullable<RecipeVariants<typeof tabGroupItemClass>>,
    'active'
  >['active']
  text: string
  pill?: PillProps
}

export const TabGroupItem = ({
  actionIconButton,
  active,
  text,
  pill,
}: TabGroupItemProps) => {
  return (
    <div className={tabGroupItemClass({ active })}>
      {text}
      {pill && <Pill {...pill} />}
      {actionIconButton && <IconButton {...actionIconButton} />}
    </div>
  )
}
