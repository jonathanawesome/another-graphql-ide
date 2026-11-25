import { GutterMarker, gutter, type ViewUpdate } from '@codemirror/view'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { Icon, type IconNames } from '../../primitives/icon/icon'
import { pillClass } from '../../primitives/pill/pill.css'

import {
  lineStateField,
  setLineData,
  type LineData,
  type SdlAnnotation,
  type SdlTag,
} from './line-state'
import { rowAtLine } from './sdl-rows'

// Icons are React components, so each icon in the column is a small root,
// unmounted with the marker that owns it.
const iconRoots = new WeakMap<Node, Root>()

const iconElement = (name: IconNames, owner: Node) => {
  const host = document.createElement('span')
  host.className = 'cm-sdl-tag-icon'
  const root = createRoot(host)
  root.render(createElement(Icon, { name }))
  iconRoots.set(owner, root)
  return host
}

class AnnotationMarker extends GutterMarker {
  readonly annotation: SdlAnnotation | undefined
  readonly tag: SdlTag | undefined

  constructor(annotation: SdlAnnotation | undefined, tag: SdlTag | undefined) {
    super()
    this.annotation = annotation
    this.tag = tag
  }

  override eq(other: AnnotationMarker) {
    return (
      other.tag?.label === this.tag?.label &&
      other.tag?.icon === this.tag?.icon &&
      other.annotation?.value === this.annotation?.value &&
      other.annotation?.ratio === this.annotation?.ratio &&
      other.annotation?.error === this.annotation?.error
    )
  }

  override toDOM() {
    const row = document.createElement('div')
    row.className = 'cm-sdl-annotation'
    if (this.tag) {
      const tag = row.appendChild(document.createElement('span'))
      tag.className = `${pillClass} cm-sdl-tag`
      if (this.tag.icon) tag.append(iconElement(this.tag.icon, row))
      tag.append(this.tag.label)
    }
    if (this.annotation) {
      const { ratio, value, error } = this.annotation
      if (error) {
        const mark = row.appendChild(document.createElement('span'))
        mark.className = 'cm-sdl-error'
        mark.textContent = error
      }
      if (ratio !== undefined) {
        const bar = row.appendChild(document.createElement('span'))
        bar.className = 'cm-sdl-bar'
        const fill = bar.appendChild(document.createElement('span'))
        fill.style.width = `${Math.round(Math.min(Math.max(ratio, 0), 1) * 100)}%`
      }
      const text = row.appendChild(document.createElement('span'))
      text.className = 'cm-sdl-value'
      text.textContent = value
    }
    return row
  }

  override destroy(dom: Node) {
    const root = iconRoots.get(dom)
    if (!root) return
    iconRoots.delete(dom)
    // React may be mid-render when the view goes away.
    queueMicrotask(() => root.unmount())
  }
}

// An icon takes about two characters of a tag's width.
const tagLength = (tag: SdlTag) => tag.label.length + (tag.icon ? 2 : 0)

// Sized for the widest row, so the column keeps its width while scrolling.
const spacerFor = ({ annotations, tags }: LineData) => {
  let longest: SdlTag | undefined
  for (const tag of tags?.values() ?? []) {
    if (!longest || tagLength(tag) > tagLength(longest)) longest = tag
  }
  let error: string | undefined
  for (const { error: next } of annotations?.values() ?? []) {
    if (next && next.length > (error?.length ?? 0)) error = next
  }
  const annotation = annotations?.size
    ? { value: '', ratio: 0, error }
    : undefined
  return new AnnotationMarker(annotation, longest)
}

const dataChanged = (update: ViewUpdate) =>
  update.transactions.some(tr => tr.effects.some(e => e.is(setLineData)))

/** The trailing column: an optional tag and error, then a bar and a value. */
export const annotationGutter = gutter({
  class: 'cm-sdl-annotations',
  side: 'after',
  // Every row gets an element, so row tints run through the column.
  renderEmptyElements: true,
  lineMarker(view, line) {
    const number = view.state.doc.lineAt(line.from).number
    const { coordinate } = rowAtLine(view.state, number)
    if (coordinate === undefined) return null
    const { data } = view.state.field(lineStateField)
    const annotation = data.annotations?.get(coordinate)
    const tag = data.tags?.get(coordinate)
    return annotation || tag ? new AnnotationMarker(annotation, tag) : null
  },
  lineMarkerChange: dataChanged,
  initialSpacer: view => spacerFor(view.state.field(lineStateField).data),
  updateSpacer: (spacer, update) =>
    dataChanged(update)
      ? spacerFor(update.state.field(lineStateField).data)
      : spacer,
})
