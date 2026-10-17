// The Previewer's code block: the playground's usage, at rest and with the Try it values written in (docs-site S8).
export type PropValue = string | number | boolean

export interface Usage {
  /** The value imports the reader needs, already rewritten to public subpaths; type imports are dropped. */
  imports: string[]
  /** The returned JSX, dedented, still holding the `{...props}` spread or the `name={name}` pass-throughs where the values go. */
  jsx: string
  /** The props the demo destructures and passes on one by one, each to the part that takes it. */
  passed: string[]
}

const SPREAD = /[ \t]*\{\.\.\.props\}/
const IMPORT = /^import\s+(?!type\b)[^\n]*$/gm
const SIGNATURE = /export default function \w+\(\s*(?:\{([^}]*)\})?[^)]*\)[^{]*\{/
const passThrough = (name: string) => new RegExp(`\\s+${name}=\\{${name}\\}`, 'g')

/** Reads a dummy/playground.tsx whose default export only returns one JSX tree that spreads `props` or passes its props on by name. */
export function usageOf(source: string): Usage | null {
  const signature = SIGNATURE.exec(source)
  const start = source.lastIndexOf('return ')
  const end = source.lastIndexOf('}')
  if (signature === null || start === -1 || end < start) return null
  // A hook or a constant before the return is state the snippet would lose, so such a demo shows its whole source.
  if (source.slice(signature.index + signature[0].length, start).trim() !== '') return null
  const body = source.slice(start + 'return '.length, end).trim().replace(/^\(\s*\n?/, '').replace(/\n?\s*\)$/, '')
  const passed = (signature[1] ?? '').split(',').map((name) => name.trim()).filter((name) => /^\w+$/.test(name) && passThrough(name).test(body))
  if (!SPREAD.test(body) && passed.length === 0) return null
  const lines = body.split('\n')
  const indents = lines.slice(1).filter((line) => line.trim() !== '').map((line) => /^ */.exec(line)?.[0].length ?? 0)
  // A multi-line tree's closing tag sits at the root's own indent, which the first line lost to the trim.
  const cut = indents.length > 0 ? Math.min(...indents) : 0
  const jsx = lines.map((line, index) => (index === 0 ? line : line.slice(Math.min(cut, line.length - line.trimStart().length)))).join('\n')
  return { imports: source.match(IMPORT) ?? [], jsx, passed }
}

/** One JSX attribute as a reader would type it: `size="lg"`, `loading`, `fullWidth={false}`, `max={5}`. */
export function attributeOf(name: string, value: PropValue): string {
  if (value === true) return name
  if (typeof value === 'string') return `${name}=${JSON.stringify(value)}`
  return `${name}={${String(value)}}`
}

/** The props whose value differs from the default, in the order given. */
export function changedProps(values: Readonly<Record<string, PropValue>>, defaults: Readonly<Record<string, PropValue | null>>): [string, PropValue][] {
  return Object.entries(values).filter(([name, value]) => defaults[name] !== value)
}

/** The usage with the given props written where the spread or their pass-through was; with none, those are only removed. */
export function snippetOf(usage: Usage, props: readonly [string, PropValue][]): string {
  const values = new Map(props)
  const spread = props.filter(([name]) => !usage.passed.includes(name)).map(([name, value]) => ` ${attributeOf(name, value)}`).join('')
  const jsx = usage.passed.reduce((tree, name) => {
    const value = values.get(name)
    return tree.replace(passThrough(name), value === undefined ? '' : ` ${attributeOf(name, value)}`)
  }, usage.jsx.replace(SPREAD, spread))
  return usage.imports.length > 0 ? `${usage.imports.join('\n')}\n\n${jsx}` : jsx
}
