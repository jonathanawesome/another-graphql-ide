import { IconButton } from '../../ui-components/icon-button/icon-button'
import {
  TabGroup,
  TabGroupProps,
} from '../../ui-components/tab-group/tab-group'

import { editorTabGroupStyles } from './editor-tab-group.css'

export type EditorTabGroupProps = {
  tabs: TabGroupProps
}

export const EditorTabGroup = ({ tabs }: EditorTabGroupProps) => {
  return (
    <div className={editorTabGroupStyles}>
      <TabGroup {...tabs} />
      <IconButton iconName="Plus" title="Add Tab" size="mini" />
    </div>
  )
}
