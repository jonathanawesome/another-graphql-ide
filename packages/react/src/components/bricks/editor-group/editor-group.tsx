import { DocumentPane } from '../../panes/document-pane/document-pane'
import { ResponsePane } from '../../panes/response-pane/response-pane'
import { Resizer } from '../../primitives/resizer/resizer'

import { editorGroupStyles } from './editor-group.css'

/**
 * Document and response, split. Schema, endpoint and the starting document come
 * from the surrounding AGIProvider rather than props: two ways to set the same
 * thing would race through effect ordering, and the prop path used to overwrite
 * whatever the user had typed whenever its identity changed.
 */
export const EditorGroup = () => (
  <div className={editorGroupStyles.container}>
    <Resizer
      orientation="horizontal"
      firstPane={<DocumentPane />}
      secondPane={<ResponsePane />}
    />
  </div>
)
