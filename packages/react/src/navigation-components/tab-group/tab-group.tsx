import {
  TabGroupItem,
  TabGroupItemProps,
} from '../../ui-components/tab-group-item/tab-group-item'

import { tabGroupClass } from './tab-group.css'

export type TabGroupProps = {
  tabs: TabGroupItemProps[]
}

export const TabGroup = ({ tabs }: TabGroupProps) => {
  return (
    <div className={tabGroupClass}>
      {tabs.map((tabProps, i) => (
        <TabGroupItem key={i} {...tabProps} />
      ))}
    </div>
  )
}
