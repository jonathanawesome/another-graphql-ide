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
  const setSchema = useAppStore.use.setSchema()

  useEffect(() => {
    if (endpoint) setEndpoint(endpoint)
  }, [endpoint, setEndpoint])

  useEffect(() => {
    if (defaultQuery) setQuery(defaultQuery)
  }, [defaultQuery, setQuery])

  // Bridge the schema prop into shared state so the editor and the schema tree
  // read one instance. The tree reads it straight from the store.
  useEffect(() => {
    setSchema(schema)
  }, [schema, setSchema])

  return (
    <div className={editorGroupStyles.container}>
      <Resizer
        orientation="horizontal"
        firstPane={<DocumentPane />}
        secondPane={<ResponsePane />}
      />
    </div>
  )
}
