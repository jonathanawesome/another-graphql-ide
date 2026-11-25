import type { Coordinate, SdlIndex } from '../../sdl-shared/sdl-index'

/**
 * One document's coordinates and their lines, as one string and a few arrays.
 * Copying a map of 100,000 from a worker would block the page.
 */
export type CoordinateTable = {
  /** Every coordinate, each with a newline on both sides. */
  names: string
  /** Where each coordinate starts in `names`, plus one past the end. */
  starts: Uint32Array
  /** The 1-based line of each coordinate. */
  lines: Uint32Array
  /** Per 1-based line, its coordinate's position plus one, or 0. */
  atLine: Uint32Array
}

export const coordinateTable = (
  { coordinateAtLine, lineOfCoordinate }: SdlIndex,
  lineCount: number
): CoordinateTable => {
  const starts = new Uint32Array(lineOfCoordinate.size + 1)
  const lines = new Uint32Array(lineOfCoordinate.size)
  const atLine = new Uint32Array(lineCount + 1)
  const position = new Map<Coordinate, number>()
  let offset = 1
  let next = 0
  for (const [coordinate, line] of lineOfCoordinate) {
    starts[next] = offset
    lines[next] = line
    position.set(coordinate, next)
    offset += coordinate.length + 1
    next++
  }
  starts[next] = offset
  for (const [line, coordinate] of coordinateAtLine) {
    atLine[line] = (position.get(coordinate) ?? -1) + 1
  }
  const names = `\n${[...lineOfCoordinate.keys()].join('\n')}\n`
  return { names, starts, lines, atLine }
}

export const coordinateAt = (
  { names, starts, atLine }: CoordinateTable,
  line: number
): Coordinate | undefined => {
  const entry = atLine[line] ?? 0
  return entry === 0
    ? undefined
    : names.slice(starts[entry - 1], (starts[entry] ?? 1) - 1)
}

export const lineOfCoordinate = (
  { names, starts, lines }: CoordinateTable,
  coordinate: Coordinate
) => {
  const found = names.indexOf(`\n${coordinate}\n`)
  if (found === -1 || coordinate === '') return undefined
  let low = 0
  let high = lines.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if ((starts[middle] ?? 0) < found + 1) low = middle + 1
    else high = middle
  }
  return lines[low]
}
