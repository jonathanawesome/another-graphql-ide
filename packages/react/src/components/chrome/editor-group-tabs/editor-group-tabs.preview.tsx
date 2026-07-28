import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroupTabs } from './editor-group-tabs'

export const nav: NavPath = 'Chrome/Editor Group Tabs'

export const Example = createPreview(() => <EditorGroupTabs />)
