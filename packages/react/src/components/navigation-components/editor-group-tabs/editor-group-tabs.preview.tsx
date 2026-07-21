import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroupTabs } from './editor-group-tabs'

export const nav: NavPath = 'Navigation/Editor Group Tabs'

export const Example = createPreview(() => <EditorGroupTabs />)
