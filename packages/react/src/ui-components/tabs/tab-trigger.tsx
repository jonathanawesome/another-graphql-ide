// import { RecipeVariants } from '@another-graphql-ide/style'
import { Tabs as RadixTabs } from 'radix-ui'

import { IconButton, type IconButtonProps } from '../icon-button/icon-button'
import { Pill, type PillProps } from '../pill/pill'

import { tabsStyles } from './tabs.css'

export type TabTriggerProps = {
  actionIconButton?: IconButtonProps
  pill?: PillProps
  tabName: string
  text: string
}

export const TabTrigger = ({
  tabName,
  actionIconButton,
  pill,
  text,
}: TabTriggerProps) => (
  <div
    className={tabsStyles.triggerContainer({
      withActionIcon: actionIconButton && true,
    })}
  >
    <RadixTabs.Trigger
      className={tabsStyles.trigger({
        withActionIcon: actionIconButton && true,
      })}
      value={tabName}
    >
      {text}
      {pill && <Pill {...pill} />}
    </RadixTabs.Trigger>

    {actionIconButton && (
      <div className={tabsStyles.triggerAction}>
        <IconButton {...actionIconButton} />
      </div>
    )}
  </div>
)
