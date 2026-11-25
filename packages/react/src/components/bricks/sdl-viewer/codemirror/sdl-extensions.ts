import { foldService } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

import { definitionClick } from '../../sdl-shared/go-to-definition'
import { sdlTheme } from '../../sdl-shared/sdl-theme'

import { sdlField } from './sdl-field'

const folds = foldService.of((state, lineStart) => {
  const { index } = state.field(sdlField)
  return index.folds.get(state.doc.lineAt(lineStart).number) ?? null
})

/** Colors, folding and modifier-click go-to-definition, all from one index. */
export const sdlExtensions: Extension = [
  sdlField,
  folds,
  definitionClick,
  sdlTheme,
]
