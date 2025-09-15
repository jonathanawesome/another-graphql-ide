import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Tabs } from '../../ui-components/tabs/tabs'

import { editorGroupTabsStyles } from './editor-group-tabs.css'

export const EditorGroupTabs = () => {
  return (
    <div className={editorGroupTabsStyles}>
      <Tabs
        items={[
          {
            name: 'tab1',
            content: <div>Content1</div>,
            trigger: {
              text: 'OperationName',
              actionIconButton: {
                action: () => alert('Hi from Tab1'),
                ghost: true,
                label: 'X',
                name: 'X',
                size: 'mini',
              },
            },
          },
          {
            name: 'tab2',
            content: <div>Content2</div>,
            trigger: {
              text: 'Untitled',
              actionIconButton: {
                action: () => alert('Hi from Tab2'),
                ghost: true,
                label: 'X',
                name: 'X',
                size: 'mini',
              },
            },
          },
          {
            name: 'tab3',
            content: <div>Content3</div>,
            trigger: {
              text: 'MyQuery',
              actionIconButton: {
                action: () => alert('Hi from Tab3'),
                ghost: true,
                label: 'X',
                name: 'X',
                size: 'mini',
              },
            },
          },
        ]}
        label="Demo Tabs"
        defaultActiveTab="trigger1"
      />
      <IconButton name="Plus" label="Add Tab" size="mini" ghost={true} />
    </div>
  )
}
