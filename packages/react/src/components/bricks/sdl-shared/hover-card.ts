import type { Extension } from '@codemirror/state'
import { hoverTooltip, type HoverTooltipSource } from '@codemirror/view'
import type { ReactNode } from 'react'

import type { SdlLocation } from './line-state'
import type { Coordinate } from './sdl-index'
import { rowAtLine, type SdlSide } from './sdl-rows'

/** An open hover card, for the host's content to render into. */
export type HoverCard = SdlLocation & { dom: HTMLElement }

export type RenderHover = (coordinate: Coordinate, side: SdlSide) => ReactNode

const isBlank = (node: ReactNode) =>
  node === null ||
  node === undefined ||
  node === false ||
  node === true ||
  node === ''

type SetCard = (update: (card: HoverCard | null) => HoverCard | null) => void

/** The tooltip for the line at `pos`, if the host has content for it. */
export const hoverCardSource =
  (render: RenderHover, setCard: SetCard): HoverTooltipSource =>
  (view, pos) => {
    const line = view.state.doc.lineAt(pos)
    const { side, coordinate } = rowAtLine(view.state, line.number)
    if (coordinate === undefined || isBlank(render(coordinate, side))) {
      return null
    }
    const indent = /^\s*/.exec(line.text)?.[0].length ?? 0
    return {
      pos: line.from + indent,
      end: line.to,
      above: false,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-sdl-card'
        setCard(() => ({ dom, side, coordinate }))
        return {
          dom,
          destroy: () => setCard(card => (card?.dom === dom ? null : card)),
        }
      },
    }
  }

/**
 * A card under a line's text after a short hover, for lines with a
 * coordinate the host has content for. It stays open while the pointer moves
 * along the line or into the card. The card is an empty element; the host's
 * content is portaled into it.
 */
export const hoverCard = (render: RenderHover, setCard: SetCard): Extension =>
  hoverTooltip(hoverCardSource(render, setCard), { hideOnChange: true })
