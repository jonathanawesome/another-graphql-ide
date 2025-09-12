import * as RadixTabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'

import { TabTrigger, TabTriggerProps } from './tab-trigger'
import { tabsStyles } from './tabs.css'

export type TabsProps = {
  defaultActiveTab?: string
  items: Array<{
    name: string
    content: ReactNode
    trigger: Omit<TabTriggerProps, 'tabName'>
  }>
  label: string
}

export const Tabs = ({ defaultActiveTab, items, label }: TabsProps) => {
  return (
    <RadixTabs.Root
      className={tabsStyles.root}
      defaultValue={defaultActiveTab || undefined}
    >
      <RadixTabs.List className={tabsStyles.list} aria-label={label}>
        {items.map((item, i) => (
          <TabTrigger key={i} tabName={item.name} {...item.trigger} />
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
