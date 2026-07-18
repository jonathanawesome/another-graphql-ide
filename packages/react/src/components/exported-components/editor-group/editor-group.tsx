import type { GraphQLSchema } from 'graphql'
import { useEffect } from 'react'

import { useAppStore } from '../../../state'
import { DocumentPane } from '../../panes/document-pane/document-pane'
import { ResponsePane } from '../../panes/response-pane/response-pane'
import { Resizer } from '../../ui-components/resizer/resizer'

import { editorGroupStyles } from './editor-group.css'

export type EditorGroupProps = {
  schema?: GraphQLSchema
  endpoint?: string
  defaultQuery?: string
}

export const EditorGroup = ({
  schema,
  endpoint,
  defaultQuery,
}: EditorGroupProps) => {
  const setEndpoint = useAppStore.use.setEndpoint()
  const setQuery = useAppStore.use.setQuery()

  useEffect(() => {
    if (endpoint) setEndpoint(endpoint)
  }, [endpoint, setEndpoint])

  useEffect(() => {
    if (defaultQuery) setQuery(defaultQuery)
  }, [defaultQuery, setQuery])

  return (
    <div className={editorGroupStyles.container}>
      <Resizer
        orientation="horizontal"
        firstPane={<DocumentPane schema={schema} />}
        secondPane={<ResponsePane />}
      />
    </div>
  )
}
