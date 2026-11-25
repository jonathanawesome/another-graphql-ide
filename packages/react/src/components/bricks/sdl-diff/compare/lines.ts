/** A document split into lines, without copying each line out. */
export type Lines = {
  /** `\n` line endings, and no trailing newline. */
  text: string
  /** Offset of each line, plus one past the end of the text. */
  starts: Uint32Array
  count: number
}

/** CodeMirror breaks on `\r` too, so offsets only agree once it is gone. */
const normalize = (raw: string) => {
  const text = raw.includes('\r') ? raw.replace(/\r\n?/g, '\n') : raw
  return text.endsWith('\n') ? text.slice(0, -1) : text
}

export const splitLines = (raw: string): Lines => {
  const text = normalize(raw)
  if (text === '') return { text, starts: new Uint32Array(1), count: 0 }

  let count = 1
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) {
    count++
  }
  const starts = new Uint32Array(count + 1)
  let line = 1
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) {
    starts[line++] = i + 1
  }
  starts[count] = text.length + 1
  return { text, starts, count }
}

/** Offset of a 0-based line. */
export const lineStart = ({ starts }: Lines, line: number) => starts[line] ?? 0

/** Offset just past a 0-based line's last character. */
export const lineEnd = ({ starts }: Lines, line: number) =>
  (starts[line + 1] ?? 1) - 1

/** The text of a 0-based line. */
export const textOf = (lines: Lines, line: number) =>
  lines.text.slice(lineStart(lines, line), lineEnd(lines, line))
