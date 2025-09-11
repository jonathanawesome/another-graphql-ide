import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Tabs } from '../../ui-components/tabs/tabs'

import { editorTabGroupStyles } from './editor-tab-group.css'

export const EditorTabGroup = () => {
  return (
    <div className={editorTabGroupStyles}>
      <Tabs
        items={[
          {
            name: 'tab1',
            content: <div>Content1</div>,
            trigger: {
              text: 'OperationName',
              actionIconButton: {
                name: 'X',
                title: 'X',
                size: 'mini',
                action: () => alert('Hi from Tab1'),
              },
            },
          },
          {
            name: 'tab2',
            content: <div>Content2</div>,
            trigger: {
              text: 'Untitled',
              actionIconButton: {
                name: 'X',
                title: 'X',
                size: 'mini',
                action: () => alert('Hi from Tab2'),
              },
            },
          },
          {
            name: 'tab3',
            content: <div>Content3</div>,
            trigger: {
              text: 'MyQuery',
              actionIconButton: {
                name: 'X',
                title: 'X',
                size: 'mini',
                action: () => alert('Hi from Tab3'),
              },
            },
          },
        ]}
        label="Demo Tabs"
        defaultActiveTab="trigger1"
      />
      <IconButton name="Plus" title="Add Tab" size="mini" />
    </div>
  )
}
