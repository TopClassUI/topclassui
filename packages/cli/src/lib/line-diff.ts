// A unified line diff for `diff` and `add --overwrite`. Myers' O(ND) walk; copies are small files.
export type Edit = { op: ' ' | '-' | '+'; line: string }

/** CRLF and LF compare equal, so a checkout with autocrlf does not mark every line. */
export const splitLines = (text: string): string[] => {
  if (text === '') return []
  const lines = text.split(/\r?\n/)
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

export function diffLines(a: string[], b: string[]): Edit[] {
  const n = a.length
  const m = b.length
  const max = n + m
  const offset = max + 1
  const v = new Int32Array(2 * max + 3)
  const trace: Int32Array[] = []
  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && (v[offset + k - 1] ?? 0) < (v[offset + k + 1] ?? 0))
      let x = down ? (v[offset + k + 1] ?? 0) : (v[offset + k - 1] ?? 0) + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) break outer
    }
  }
  const edits: Edit[] = []
  let x = n
  let y = m
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d] ?? v
    const k = x - y
    const down = k === -d || (k !== d && (vd[offset + k - 1] ?? 0) < (vd[offset + k + 1] ?? 0))
    const prevK = down ? k + 1 : k - 1
    const prevX = vd[offset + prevK] ?? 0
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      x--
      y--
      edits.push({ op: ' ', line: a[x] ?? '' })
    }
    if (d > 0) {
      if (down) edits.push({ op: '+', line: b[--y] ?? '' })
      else edits.push({ op: '-', line: a[--x] ?? '' })
    }
  }
  return edits.reverse()
}

/** `--- a/<path>` and `+++ b/<path>` hunks with three lines of context; empty when the texts match. */
export function unifiedDiff(path: string, before: string, after: string, context = 3): string {
  const a = splitLines(before)
  const b = splitLines(after)
  const edits = diffLines(a, b)
  if (edits.every((e) => e.op === ' ')) return ''
  const aAt: number[] = []
  const bAt: number[] = []
  let aLine = 1
  let bLine = 1
  for (const e of edits) {
    aAt.push(aLine)
    bAt.push(bLine)
    if (e.op !== '+') aLine++
    if (e.op !== '-') bLine++
  }
  const changed = edits.flatMap((e, i) => (e.op === ' ' ? [] : [i]))
  const groups: [number, number][] = []
  for (const i of changed) {
    const last = groups[groups.length - 1]
    if (last !== undefined && i - last[1] <= context * 2 + 1) last[1] = i
    else groups.push([i, i])
  }
  const out = [`--- a/${path}`, `+++ b/${path}`]
  for (const [first, lastChange] of groups) {
    const start = Math.max(0, first - context)
    const end = Math.min(edits.length, lastChange + context + 1)
    const hunk = edits.slice(start, end)
    const aCount = hunk.filter((e) => e.op !== '+').length
    const bCount = hunk.filter((e) => e.op !== '-').length
    const aStart = aCount === 0 ? (aAt[start] ?? 1) - 1 : (aAt[start] ?? 1)
    const bStart = bCount === 0 ? (bAt[start] ?? 1) - 1 : (bAt[start] ?? 1)
    out.push(`@@ -${String(aStart)},${String(aCount)} +${String(bStart)},${String(bCount)} @@`)
    for (const e of hunk) out.push(`${e.op}${e.line}`)
  }
  return `${out.join('\n')}\n`
}
