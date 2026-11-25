/** A line of `before` and the line of `after` it equals, 0-based. */
type Pair = [before: number, after: number]

// Below this many lines a gap gets a full Myers diff. Above it, Myers stops
// after this many edits, so one pathological gap can't take seconds.
const SMALL_GAP = 400
const EDIT_CAP = 200
// Each level splits on the lines unique to a gap; text rarely needs three.
const MAX_DEPTH = 8

/** Myers' diff, or nothing when it would take more than `cap` edits. */
const myers = (a: Int32Array, b: Int32Array, cap: number): Pair[] => {
  const max = Math.min(cap, a.length + b.length)
  const offset = max + 1
  const reach = new Int32Array(2 * max + 3)
  const trace: Int32Array[] = []

  for (let d = 0; d <= max; d++) {
    trace.push(reach.slice(offset - d - 1, offset + d + 2))
    for (let k = -d; k <= d; k += 2) {
      const left = reach[offset + k - 1] ?? 0
      const right = reach[offset + k + 1] ?? 0
      let x = k === -d || (k !== d && left < right) ? right : left + 1
      while (x < a.length && x - k < b.length && a[x] === b[x - k]) x++
      reach[offset + k] = x
      if (x >= a.length && x - k >= b.length) {
        return backtrack(trace, d, a.length, b.length)
      }
    }
  }
  return []
}

const backtrack = (
  trace: Int32Array[],
  edits: number,
  aLength: number,
  bLength: number
) => {
  const pairs: Pair[] = []
  let x = aLength
  let y = bLength
  for (let d = edits; d > 0; d--) {
    const reach = trace[d]
    const at = (k: number) => reach?.[d + 1 + k] ?? 0
    const k = x - y
    const from = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1
    const fromX = at(from)
    const fromY = fromX - from
    while (x > fromX && y > fromY) pairs.push([--x, --y])
    x = fromX
    y = fromY
  }
  while (x > 0 && y > 0) pairs.push([--x, --y])
  return pairs.reverse()
}

/** Lines unique to both sides, as the longest run in the same order. */
const anchors = (a: Int32Array, b: Int32Array): Pair[] => {
  const seen = new Map<
    number,
    { inA: number; inB: number; atA: number; atB: number }
  >()
  a.forEach((id, i) => {
    const entry = seen.get(id)
    if (entry) entry.inA++
    else seen.set(id, { inA: 1, inB: 0, atA: i, atB: 0 })
  })
  b.forEach((id, i) => {
    const entry = seen.get(id)
    if (!entry) return
    entry.inB++
    entry.atB = i
  })

  // Already in `a` order, since a Map keeps insertion order.
  const unique: Pair[] = []
  for (const { inA, inB, atA, atB } of seen.values()) {
    if (inA === 1 && inB === 1) unique.push([atA, atB])
  }

  const tails: number[] = []
  const previous = new Int32Array(unique.length).fill(-1)
  unique.forEach(([, at], i) => {
    let low = 0
    let high = tails.length
    while (low < high) {
      const middle = (low + high) >> 1
      if ((unique[tails[middle] ?? 0]?.[1] ?? 0) < at) low = middle + 1
      else high = middle
    }
    if (low > 0) previous[i] = tails[low - 1] ?? -1
    tails[low] = i
  })

  const run: Pair[] = []
  for (let i = tails.at(-1) ?? -1; i !== -1; i = previous[i] ?? -1) {
    const pair = unique[i]
    if (pair) run.push(pair)
  }
  return run.reverse()
}

/**
 * Lines of `a` matched to equal lines of `b`, both ascending. Lines unique to
 * both sides split the work first, then each gap gets a bounded Myers diff, so
 * cost stays near linear. A gap past the bound counts as replaced.
 */
export const matchLines = (a: Int32Array, b: Int32Array): Pair[] => {
  const pairs: Pair[] = []

  const match = (
    a: Int32Array,
    b: Int32Array,
    aOffset: number,
    bOffset: number,
    depth: number
  ) => {
    let start = 0
    while (start < a.length && start < b.length && a[start] === b[start]) {
      pairs.push([aOffset + start, bOffset + start])
      start++
    }
    let aEnd = a.length
    let bEnd = b.length
    while (aEnd > start && bEnd > start && a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--
      bEnd--
    }

    if (aEnd > start && bEnd > start) {
      const x = a.subarray(start, aEnd)
      const y = b.subarray(start, bEnd)
      const small = x.length + y.length <= SMALL_GAP
      const points = small || depth > MAX_DEPTH ? [] : anchors(x, y)
      if (points.length > 0) {
        let fromX = 0
        let fromY = 0
        for (const [atX, atY] of [...points, [x.length, y.length] as Pair]) {
          match(
            x.subarray(fromX, atX),
            y.subarray(fromY, atY),
            aOffset + start + fromX,
            bOffset + start + fromY,
            depth + 1
          )
          if (atX < x.length) {
            pairs.push([aOffset + start + atX, bOffset + start + atY])
          }
          fromX = atX + 1
          fromY = atY + 1
        }
      } else {
        for (const [atX, atY] of myers(x, y, small ? SMALL_GAP : EDIT_CAP)) {
          pairs.push([aOffset + start + atX, bOffset + start + atY])
        }
      }
    }

    for (let i = 0; aEnd + i < a.length; i++) {
      pairs.push([aOffset + aEnd + i, bOffset + bEnd + i])
    }
  }

  match(a, b, 0, 0, 0)
  return pairs
}
