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

/** `['--tc-page', '--tc-surface']` to `'--tc-page, surface'`: the first name in full, the rest without `--` and `tc-`. */
export function familyOf(tokens: readonly string[]): string {
  const [first = '', ...rest] = tokens
  return [first, ...rest.map((token) => token.replace(/^--(tc-)?/, ''))].join(', ')
}
