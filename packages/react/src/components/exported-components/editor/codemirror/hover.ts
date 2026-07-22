import { hoverTooltip } from '@codemirror/view'
import { getSchema, offsetToPos } from 'cm6-graphql'
import { getHoverInformation } from 'graphql-language-service'

/**
 * GraphQL hover tooltip. cm6-graphql ships no hover, so add one over its schema
 * state field. Reading the schema at hover time keeps it correct across both the
 * updateSchema fast path and a full language reconfigure.
 */
export const graphqlHover = () =>
  hoverTooltip((view, pos) => {
    const schema = getSchema(view.state)
    if (!schema) return null

    const position = offsetToPos(view.state.doc, pos)
    const info = getHoverInformation(
      schema,
      view.state.doc.toString(),
      position
    )

    // getHoverInformation returns '' for nothing hoverable, or an array.
    if (typeof info !== 'string' || info.length === 0) return null

    const word = view.state.wordAt(pos)

    return {
      pos: word ? word.from : pos,
      end: word ? word.to : pos,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-graphql-hover'
        dom.textContent = info
        return { dom }
      },
    }
  })
