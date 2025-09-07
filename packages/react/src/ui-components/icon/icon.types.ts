import { type RecipeVariants } from '@another-graphql-ide/style'

import { BookOpenText } from './book-open-text'

import { iconClass } from './icon.css'

export const IconMap = {
  BookOpenText,
}

type IconVariants = RecipeVariants<typeof iconClass>

export type IconNames = keyof typeof IconMap

export type IconProps = IconVariants & {
  name: IconNames
}
