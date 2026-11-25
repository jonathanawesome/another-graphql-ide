const isField = (line: string) => /^ {2}\w+(\(.*\))?: /.test(line)

/**
 * `count` edits spread evenly over the field lines, repeating: two changed, one
 * added, one removed. Deterministic. `removed` and `added` are the lines a
 * perfect diff would show.
 */
export const editFields = (sdl: string, count: number) => {
  const lines = sdl.split('\n')
  const fields = lines.flatMap((line, i) => (isField(line) ? [i] : []))
  const text: (string | null)[] = [...lines]
  let removed = 0
  let added = 0
  for (let edit = 0; edit < count; edit++) {
    const i = fields[Math.floor((edit * fields.length) / count)] ?? 0
    const line = lines[i] ?? ''
    if (edit % 4 < 2) {
      text[i] = line.replace(/: (\[?\w+)/, ': $1Edited')
      removed++
      added++
    } else if (edit % 4 === 2) {
      text[i] = `${line}\n  added${edit}: String`
      added++
    } else {
      text[i] = null
      removed++
    }
  }
  return { sdl: text.filter(line => line !== null).join('\n'), removed, added }
}

/** Every definition in a seeded random order. Needs blank lines between them. */
export const reorderDefinitions = (sdl: string) => {
  const blocks = sdl.trimEnd().split('\n\n')
  let seed = 42
  for (let i = blocks.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = Math.floor((seed / 2 ** 32) * (i + 1))
    const block = blocks[i] ?? ''
    blocks[i] = blocks[j] ?? ''
    blocks[j] = block
  }
  return `${blocks.join('\n\n')}\n`
}
