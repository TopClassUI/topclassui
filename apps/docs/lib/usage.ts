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

const attributeNamed = (name: string) => new RegExp(`(\\s)${name}=(?:\\{[^{}]*\\}|"[^"]*")`, 'g')

/** The root element's opening tag with every brace's contents blanked, so only its own attributes can match. */
function rootTagOf(jsx: string): string {
  let depth = 0
  let quote: string | null = null
  let tag = ''
  for (const char of jsx) {
    if (quote !== null) {
      if (char === quote) quote = null
    } else if (depth === 0 && (char === '"' || char === "'")) quote = char
    else if (char === '{') depth += 1
    else if (char === '}') depth -= 1
    else if (char === '>' && depth === 0) return `${tag}>`
    tag += depth > 1 || (depth === 1 && char !== '{') ? ' ' : char
  }
  return tag
}

/** The usage with the given props written in: over a pass-through of the same name wherever it is (a part's
 * `current={current}`), over a literal on the root itself (`value={6}`), else where the spread was; unset pass-throughs are dropped. */
export function snippetOf(usage: Usage, props: readonly [string, PropValue][]): string {
  let jsx = usage.jsx
  const spread: string[] = []
  for (const [name, value] of props) {
    const attribute = ` ${attributeOf(name, value)}`
    const root = rootTagOf(jsx)
    const literal = [...root.matchAll(attributeNamed(name))][0]
    if (passThrough(name).test(jsx)) jsx = jsx.replace(passThrough(name), attribute)
    else if (literal === undefined) spread.push(attribute)
    else {
      // The blanked tag keeps every offset, so the match's place in it is its place in the tree.
      const start = literal.index + (literal[1]?.length ?? 0)
      const length = literal[0].length - (literal[1]?.length ?? 0)
      jsx = `${jsx.slice(0, start)}${attributeOf(name, value)}${jsx.slice(start + length)}`
    }
  }
  jsx = usage.passed.reduce((tree, name) => tree.replace(passThrough(name), ''), jsx)
  jsx = jsx.replace(/[ \t]+(\w+)=\{\1\}/g, '').replace(SPREAD, spread.join(''))
  return usage.imports.length > 0 ? `${usage.imports.join('\n')}\n\n${jsx}` : jsx
}

const DOC_COMMENT = /^\/\*\*[\s\S]*?\*\/\n(?=export default function)/m
const TYPE_IMPORT = /^import\s+type\b[^\n]*\n/gm

/** A demo shown whole, as a reader would write it: no type imports, no docs comment, and the props the docs
 * stage passes in taken out of the signature, the pass-throughs and the `name ?? fallback` reads. */
export function cleanSourceOf(source: string): string {
  const signature = SIGNATURE.exec(source)
  const names = (signature?.[1] ?? '').split(',').map((name) => name.trim()).filter((name) => /^\w+$/.test(name))
  let code = source.replace(TYPE_IMPORT, '').replace(DOC_COMMENT, '')
  if (signature !== null && names.length > 0) {
    code = code.replace(/(export default function \w+\()\s*\{[^}]*\}[^)]*\)/, '$1)')
    for (const name of names) {
      code = code.replace(new RegExp(`\\n[ \\t]*${name}=\\{${name}\\}(?=\\n)`, 'g'), '').replace(passThrough(name), '')
      code = code.replace(new RegExp(`\\b${name} \\?\\? `, 'g'), '')
    }
  }
  return code.replace(/\n{3,}/g, '\n\n')
}
