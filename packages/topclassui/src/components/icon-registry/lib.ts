/** The export name the per-icon module uses, so the warning can name the real import. */
export function camelCase(name: string): string {
  const [first = '', ...rest] = name.split('-')
  return first + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}
