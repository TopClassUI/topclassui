// The four range forms package.json files use in practice (exact, ^, ~, >=); anything else counts as unknown.
export type Version = [number, number, number]

/** `19.2.0`, `v19.2.0-rc.1` or `19` gives [19, 2, 0]; null when there is no leading number. */
export function parseVersion(text: string): Version | null {
  const match = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(text)
  if (match === null) return null
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)]
}

export function compare(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

/** The lowest version a declared range allows: `^19.1.0` gives 19.1.0, `workspace:*` gives null. */
export function minVersion(range: string): Version | null {
  if (/^(workspace|file|link|git|https?):/.test(range) || range === '*' || range === 'latest') return null
  return parseVersion(range)
}

export const atLeast = (version: Version | null, floor: Version): boolean => version !== null && compare(version, floor) >= 0

/** Whether an installed version satisfies a range of the forms above. */
export function satisfies(installed: string, range: string): boolean {
  const v = parseVersion(installed)
  const min = minVersion(range)
  if (v === null || min === null) return false
  if (compare(v, min) < 0) return false
  const op = /^\s*(\^|~|>=)?/.exec(range)?.[1]
  if (op === '>=') return true
  if (op === '~') return v[0] === min[0] && v[1] === min[1]
  if (op === '^') return min[0] > 0 ? v[0] === min[0] : v[1] === min[1]
  return compare(v, min) === 0
}

export const format = (v: Version): string => v.join('.')
