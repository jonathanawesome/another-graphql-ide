import { useAppStore } from '../../../state'
import { Editor } from '../../exported-components/editor/editor'
import { DocumentHeader } from '../document-response-headers/document-header'

import { documentPaneStyles } from './document-pane.css'

export const DocumentPane = () => {
  const schema = useAppStore.use.schema()
  const query = useAppStore.use.query()
  const operationName = useAppStore.use.operationName()
  const pendingSelection = useAppStore.use.pendingSelection()
  const setQuery = useAppStore.use.setQuery()
  const setOperationName = useAppStore.use.setOperationName()
  const setCursor = useAppStore.use.setCursor()
  const execute = useAppStore.use.execute()

  return (
    <div className={documentPaneStyles.container}>
      <DocumentHeader
        operationName={operationName}
        onExecute={() => void execute()}
        onCopy={() => void navigator.clipboard.writeText(query)}
      />
      <div className={documentPaneStyles.editor}>
        <Editor
          language="graphql"
          schema={schema}
          value={query}
          onChange={setQuery}
          onActiveOperationChange={setOperationName}
          onSelectionChange={setCursor}
          pendingSelection={pendingSelection}
        />
      </div>
    </div>
  )
}
