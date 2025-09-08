import { type RecipeVariants } from '@another-graphql-ide/style'

import { BookOpenText } from './icons/book-open-text'
import { BowArrow } from './icons/bow-arrow'
import { Caret } from './icons/caret'
import { Chevron } from './icons/chevron'
import { ChevronsUpDown } from './icons/chevrons-up-down'
import { CircleFill } from './icons/circle-fill'
import { Code } from './icons/code'
import { Combine } from './icons/combine'
import { Compass } from './icons/compass'
import { Copy } from './icons/copy'
import { Gear } from './icons/gear'
import { GraphQL } from './icons/graphql'
import { InsertCode } from './icons/insert-code'
import { Play } from './icons/play'
import { Plus } from './icons/plus'
import { Prettier } from './icons/prettier'
import { Search } from './icons/search'
import { SeparatorRound } from './icons/separator-round'
import { SeparatorSquare } from './icons/separator-square'
import { Settings2 } from './icons/settings-2'
import { Tabs } from './icons/tabs'
import { X } from './icons/x'

import { iconClass } from './icon.css'

export const IconMap = {
  BookOpenText,
  BowArrow,
  Caret,
  Chevron,
  ChevronsUpDown,
  CircleFill,
  Code,
  Combine,
  Compass,
  Copy,
  Gear,
  GraphQL,
  InsertCode,
  Play,
  Plus,
  Prettier,
  Search,
  SeparatorRound,
  SeparatorSquare,
  Settings2,
  Tabs,
  X,
}

type IconVariants = RecipeVariants<typeof iconClass>

export type IconNames = keyof typeof IconMap

export type IconProps = IconVariants & {
  name: IconNames
}
