import * as RadixTabs from '@radix-ui/react-tabs'
import { useState, type ReactNode } from 'react'

import { TabTrigger, TabTriggerProps } from './tab-trigger'
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
    <RadixTabs.Root
      className={tabsStyles.root}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <RadixTabs.List className={tabsStyles.list} aria-label={label}>
        {items.map((item, i) => (
          <TabTrigger
            key={i}
            tabName={item.name}
            isActive={activeTab === item.name}
            {...item.trigger}
          />
        ))}
      </RadixTabs.List>
      {items.map((item, i) => (
        <RadixTabs.Content
          className={tabsStyles.content}
          value={item.name}
          key={i}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
