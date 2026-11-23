import { Editor } from '../../components/bricks/editor/editor'
import { useOperationExtensions } from '../../components/bricks/editor/hooks/use-operation-extensions'
import { VariablesEditor } from '../../components/bricks/variables-editor/variables-editor'
import { RunControl } from '../../components/primitives/run-control/run-control'
import { useAppStore } from '../../state'
import { useInstanceAttr } from '../../state/instance-id'

import { docsEditorStyles } from './docs-editor.css'

export type DocsEditorProps = {
  /** Explicit height; defaults to filling the parent. */
  height?: number | string
  /** Vertical stacks the panes, which suits a narrow docs column. */
  orientation?: 'vertical' | 'horizontal'
  readOnly?: boolean
  showVariables?: boolean
}

/**
 * Editor and response, and nothing else. No connection bar, schema tree, tabs
 * or drag handles: the endpoint, headers and starting document all come from
 * the surrounding AGIProvider.
 */
export const DocsEditor = ({
  height,
  orientation = 'vertical',
  readOnly = false,
  showVariables = false,
}: DocsEditorProps) => {
  const schema = useAppStore.use.schema()
  const query = useAppStore.use.query()
  const response = useAppStore.use.response()
  const status = useAppStore.use.status()
  const error = useAppStore.use.error()
  const setQuery = useAppStore.use.setQuery()
  const setOperationName = useAppStore.use.setOperationName()
  const setCursor = useAppStore.use.setCursor()
  const execute = useAppStore.use.execute()
  const cancel = useAppStore.use.cancel()

  const instanceAttr = useInstanceAttr()
  const extensions = useOperationExtensions({
    onActiveOperationChange: setOperationName,
    onSelectionChange: setCursor,
  })

  return (
    <div
      {...instanceAttr}
      className={docsEditorStyles.container({ orientation })}
      style={height !== undefined ? { height } : undefined}
    >
      <div className={docsEditorStyles.pane}>
        <div className={docsEditorStyles.toolbar}>
          <RunControl
            status={status}
            error={error}
            onRun={() => void execute()}
            onCancel={cancel}
          />
        </div>

        <div className={docsEditorStyles.editor}>
          <Editor
            language="graphql"
            schema={schema}
            value={query}
            onChange={setQuery}
            extensions={extensions}
            readOnly={readOnly}
          />
        </div>

        {showVariables && <VariablesEditor label="Variables" height={120} />}
      </div>

      <div className={docsEditorStyles.pane}>
        <div className={docsEditorStyles.paneLabel}>Response</div>
        <div className={docsEditorStyles.editor}>
          <Editor language="json5" value={response} readOnly />
        </div>
      </div>
    </div>
  )
}
