import { useAppStore } from '../../../state'
import { useInstanceAttr } from '../../../state/instance-id'
import { Editor } from '../../bricks/editor/editor'
import { copyText } from '../copy-text'
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
  const cancel = useAppStore.use.cancel()
  const status = useAppStore.use.status()
  const error = useAppStore.use.error()

  const instanceAttr = useInstanceAttr()

  return (
    <div {...instanceAttr} className={documentPaneStyles.container}>
      <DocumentHeader
        operationName={operationName}
        onExecute={() => void execute()}
        onCopy={() => copyText(query)}
        onCancel={cancel}
        status={status}
        error={error}
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
