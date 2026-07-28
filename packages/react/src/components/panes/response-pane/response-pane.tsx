import { useAppStore } from '../../../state'
import { Editor } from '../../exported-components/editor/editor'
import { copyText } from '../copy-text'
import { ResponseHeader } from '../document-response-headers/response-header'

import { responsePaneStyles } from './response-pane.css'

export const ResponsePane = () => {
  const response = useAppStore.use.response()

  return (
    <div className={responsePaneStyles.container}>
      <ResponseHeader onCopy={() => copyText(response)} />
      <div className={responsePaneStyles.editor}>
        <Editor language="json5" value={response} readOnly />
      </div>
    </div>
  )
}
