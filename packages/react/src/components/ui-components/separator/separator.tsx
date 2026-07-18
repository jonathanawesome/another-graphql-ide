import type { RecipeVariants } from '@another-graphql-ide/style'

import { separatorClass } from './separator.css'

export type SeparatorProps = {
  orientation: Pick<
    NonNullable<RecipeVariants<typeof separatorClass>>,
    'orientation'
  >['orientation']
}

export const Separator = ({ orientation }: SeparatorProps) => {
  return <span className={separatorClass({ orientation })} />
}
