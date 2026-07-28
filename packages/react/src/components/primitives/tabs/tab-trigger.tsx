import { Tabs as BaseTabs } from '@base-ui/react/tabs'

import { IconButton, type IconButtonProps } from '../icon-button/icon-button'
import { Pill, type PillProps } from '../pill/pill'

import { tabsStyles } from './tabs.css'

export type TabTriggerProps = {
  actionButton?: IconButtonProps
  pill?: PillProps
  tabName: string
  text: string
  isActive?: boolean
}

export const TabTrigger = ({
  tabName,
  actionButton,
  pill,
  text,
  isActive,
}: TabTriggerProps) => (
  <div className={tabsStyles.triggerContainer}>
    <BaseTabs.Tab
      className={tabsStyles.trigger({
        withAction: actionButton && true,
      })}
      value={tabName}
    >
      {text}
      {pill && <Pill {...pill} />}
    </BaseTabs.Tab>

    {actionButton && (
      <div className={tabsStyles.triggerAction}>
        <IconButton {...actionButton} tabIndex={isActive ? 0 : -1} />
      </div>
    )}
  </div>
)
