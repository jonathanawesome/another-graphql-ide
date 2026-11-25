import { foldable } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { afterEach, describe, expect, it } from 'vitest'

import { goToDefinition } from '../../sdl-shared/go-to-definition'

import { sdlExtensions } from './sdl-extensions'
import { sdlField } from './sdl-field'

const sdl = `type Query {
  user: User
}

type User @key(fields: "id") {
  id: ID!
}

directive @key(fields: String!) on OBJECT
`

let view: EditorView | undefined
const mount = (doc: string) =>
  (view = new EditorView({
    state: EditorState.create({ doc, extensions: sdlExtensions }),
  }))

afterEach(() => view?.destroy())

describe('sdlExtensions', () => {
  it('folds a type body', () => {
    const { state } = mount(sdl)
    const line = state.doc.line(1)

    expect(foldable(state, line.from, line.to)).toEqual({
      from: sdl.indexOf('{') + 1,
      to: sdl.indexOf('}'),
    })
  })

  it('goes to the definition of a type name', () => {
    const editor = mount(sdl)

    expect(goToDefinition(editor, sdl.indexOf('User\n'))).toBe(true)
    const { from, to } = editor.state.selection.main
    expect([from, to]).toEqual([
      sdl.indexOf('User @key'),
      sdl.indexOf('User @key') + 4,
    ])
  })

  it('goes to the definition of a directive', () => {
    const editor = mount(sdl)

    expect(goToDefinition(editor, sdl.indexOf('key(fields: "id")'))).toBe(true)
    expect(editor.state.selection.main.from).toBe(
      sdl.indexOf('key(fields: String')
    )
  })

  it('ignores names that are not types or directives', () => {
    expect(goToDefinition(mount(sdl), sdl.indexOf('id: ID'))).toBe(false)
  })

  it('re-indexes when the document changes', () => {
    const editor = mount(sdl)
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: 'scalar Date' },
    })

    expect(
      editor.state.field(sdlField).index.lineOfCoordinate.get('Date')
    ).toBe(1)
  })
})
