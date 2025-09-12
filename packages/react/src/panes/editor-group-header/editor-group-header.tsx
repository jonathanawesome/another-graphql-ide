import { RecipeVariants } from '@another-graphql-ide/style'
import { type ReactNode } from 'react'

import { editorGroupHeaderStyles } from './editor-group-header.css'

export type EditorGroupHeaderProps = {
  controlGroup: ReactNode
  title: string
  variant: Pick<
    NonNullable<RecipeVariants<typeof editorGroupHeaderStyles.container>>,
    'variant'
  >['variant']
}

export const EditorGroupHeader = ({
  controlGroup,
  title,
  variant,
}: EditorGroupHeaderProps) => {
  return (
    <div className={editorGroupHeaderStyles.container({ variant })}>
      <div className={editorGroupHeaderStyles.left}>
        <div className={editorGroupHeaderStyles.title}>{title}</div>
      </div>
      <div className={editorGroupHeaderStyles.right}>{controlGroup}</div>
    </div>
  )
}
