import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { useState, type ReactNode } from 'react'

import type { TabTriggerProps } from './tab-trigger'
import { TabTrigger } from './tab-trigger'
import { tabsStyles } from './tabs.css'

export type TabsProps = {
  defaultActiveTab?: string
  items: {
    name: string
    content: ReactNode
    trigger: Omit<TabTriggerProps, 'tabName' | 'isActive'>
  }[]
  label: string
}

export const Tabs = ({ defaultActiveTab, items, label }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab ?? items[0]?.name)

  return (
    <BaseTabs.Root
      className={tabsStyles.root}
      value={activeTab}
      onValueChange={value => setActiveTab(value as string)}
    >
      <BaseTabs.List className={tabsStyles.list} aria-label={label}>
        {items.map((item, i) => (
          <TabTrigger
            key={i}
            tabName={item.name}
            isActive={activeTab === item.name}
            {...item.trigger}
          />
        ))}
      </BaseTabs.List>
      {items.map((item, i) => (
        <BaseTabs.Panel
          className={tabsStyles.content}
          value={item.name}
          key={i}
        >
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  )
}
