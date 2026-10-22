// The short forms the CSS entry frame draws in "The utility names you get": a family named once, a scale by its ends.
const SCALE = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** `['h-control-xs', ..., 'h-control-xl']` to `['h-control-xs', 'h-control-xl']`, or null when the values are not one full scale. */
export function scaleEndsOf(values: readonly string[]): readonly [string, string] | null {
  if (values.length !== SCALE.length) return null
  const first = values[0] ?? ''
  const stem = first.slice(0, first.length - SCALE[0].length)
  if (!values.every((value, index) => value === `${stem}${SCALE[index] ?? ''}`)) return null
  return [first, values[values.length - 1] ?? '']
}

/** `['--tc-page', '--tc-surface']` to `'--tc-page, surface'`: the first name in full, the rest without the family's prefix. */
export function familyOf(tokens: readonly string[]): string {
  const [first = '', ...rest] = tokens
  const prefix = /^--(tc-|spacing-)?/.exec(first)?.[0] ?? '--'
  const short = rest.map((token) => (token.startsWith(prefix) ? token.slice(prefix.length) : token.replace(/^--/, '')))
  // '--tc-primary-solid, primary-soft' reads '--tc-primary-solid, soft': a stem every short name shares is said once.
  const stem = /^[^-]+-/.exec(first.slice(prefix.length))?.[0] ?? ''
  const shared = stem !== '' && short.every((name) => name.startsWith(stem))
  return [first, ...short.map((name) => (shared ? name.slice(stem.length) : name))].join(', ')
}

const TONE = /^--tc-(neutral|success|warning|danger|info)-/

export interface UtilityRow {
  tokens: readonly string[]
  utilities: readonly string[]
  /** The tones a `{tone}` row stands for, or null. */
  tones: readonly string[] | null
  /** True for the one row of every xs to xl scale, written with `*`. */
  scale: boolean
}

/** The frame's grouping: the five tones as one `{tone}` row and every xs to xl scale as one `*` row, each where its first member stood. */
export function groupedRows(rows: readonly { tokens: readonly string[]; utilities: readonly string[] }[]): UtilityRow[] {
  const toneRows = rows.filter((row) => TONE.test(row.tokens[0] ?? ''))
  const scaleRows = rows.filter((row) => scaleEndsOf(row.tokens) !== null)
  const tones = toneRows.map((row) => TONE.exec(row.tokens[0] ?? '')?.[1] ?? '')
  const out: UtilityRow[] = []
  for (const row of rows) {
    if (row === toneRows[0]) {
      const tone = tones[0] ?? ''
      const general = (value: string) => value.replace(`-${tone}-`, '-{tone}-')
      out.push({ tokens: row.tokens.map(general), utilities: row.utilities.map(general), tones, scale: false })
    } else if (row === scaleRows[0]) {
      const star = (values: readonly string[]) => values.map((value) => `${value.slice(0, value.lastIndexOf('-') + 1)}*`)
      out.push({ tokens: scaleRows.flatMap((each) => star(each.tokens).slice(0, 1)), utilities: scaleRows.flatMap((each) => star(each.utilities).slice(0, 1)), tones: null, scale: true })
    } else if (!toneRows.includes(row) && !scaleRows.includes(row)) {
      out.push({ ...row, tones: null, scale: false })
    }
  }
  return out
}
