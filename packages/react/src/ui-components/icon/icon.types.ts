import { type RecipeVariants } from '@another-graphql-ide/style'

import { IconMap } from './icon-map'
import { iconClass } from './icon.css'

type IconVariants = RecipeVariants<typeof iconClass>

export type IconNames = keyof typeof IconMap

export type IconProps = IconVariants & {
  name: IconNames
}
