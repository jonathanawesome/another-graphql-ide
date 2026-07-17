import { editorGroupStyles } from './editor-group.css'

export type EditorGroupProps = {
  something: string
}

export const EditorGroup = ({ something }: EditorGroupProps) => {
  return (
    <div className={editorGroupStyles.container}>editorgroup{something}</div>
  )
}
