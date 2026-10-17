// The Previewer's code block: the playground's usage, at rest and with the Try it values written in (docs-site S8).
export type PropValue = string | number | boolean

export interface Usage {
  /** The value imports the reader needs, already rewritten to public subpaths; type imports are dropped. */
  imports: string[]
  /** The returned JSX, dedented, still holding the `{...props}` spread where the values go. */
  jsx: string
}

const SPREAD = /[ \t]*\{\.\.\.props\}/
const IMPORT = /^import\s+(?!type\b)[^\n]*$/gm

/** Reads a dummy/playground.tsx whose default export returns one JSX tree that spreads `props`. */
export function usageOf(source: string): Usage | null {
  const start = source.lastIndexOf('return ')
  const end = source.lastIndexOf('}')
  if (start === -1 || end < start) return null
  const body = source.slice(start + 'return '.length, end).trim().replace(/^\(\s*\n?/, '').replace(/\n?\s*\)$/, '')
  if (!SPREAD.test(body)) return null
  const lines = body.split('\n')
  const indents = lines.slice(1).filter((line) => line.trim() !== '').map((line) => /^ */.exec(line)?.[0].length ?? 0)
  // A multi-line tree's closing tag sits at the root's own indent, which the first line lost to the trim.
  const cut = indents.length > 0 ? Math.min(...indents) : 0
  const jsx = lines.map((line, index) => (index === 0 ? line : line.slice(Math.min(cut, line.length - line.trimStart().length)))).join('\n')
  return { imports: source.match(IMPORT) ?? [], jsx }
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

const attributeNamed = (name: string) => new RegExp(`(\\s)${name}=(?:\\{[^{}]*\\}|"[^"]*")`, 'g')

/** The usage with the given props written in: over an attribute of the same name wherever the tree
 * has one (a part's `current={current}`), else where the spread was; an unset `name={name}` is dropped. */
export function snippetOf(usage: Usage, props: readonly [string, PropValue][]): string {
  let jsx = usage.jsx
  const spread: string[] = []
  for (const [name, value] of props) {
    const pattern = attributeNamed(name)
    if (pattern.test(jsx)) jsx = jsx.replace(pattern, (_, space: string) => `${space}${attributeOf(name, value)}`)
    else spread.push(` ${attributeOf(name, value)}`)
  }
  jsx = jsx.replace(/[ \t]+(\w+)=\{\1\}/g, '').replace(SPREAD, spread.join(''))
  return usage.imports.length > 0 ? `${usage.imports.join('\n')}\n\n${jsx}` : jsx
}
