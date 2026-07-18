import type { GraphQLSchema } from 'graphql'

import { useAppStore } from '../../../state'
import { Editor } from '../../exported-components/editor/editor'
import { DocumentHeader } from '../document-response-headers/document-header'

import { documentPaneStyles } from './document-pane.css'

export type DocumentPaneProps = {
  schema?: GraphQLSchema
}

export const DocumentPane = ({ schema }: DocumentPaneProps) => {
  const query = useAppStore.use.query()
  const operationName = useAppStore.use.operationName()
  const setQuery = useAppStore.use.setQuery()
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
        />
      </div>
    </div>
  )
}
