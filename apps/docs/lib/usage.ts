// The Previewer's code block: the playground's usage, at rest and with the Try it values written in (docs-site S8).
export type PropValue = string | number | boolean

export interface Usage {
  /** The value imports the reader needs, already rewritten to public subpaths; type imports are dropped. */
  imports: string[]
  /** The returned JSX, dedented, still holding the `{...props}` spread or the `name={name}` pass-throughs where the values go. */
  jsx: string
  /** The props the demo destructures and passes on one by one, each to the part that takes it. */
  passed: string[]
  /** The props the tree only tests to pick a branch (`{media ? <CardMedia /> : null}`), each with the default its signature gives. */
  switches?: Record<string, boolean>
}

const SPREAD = /[ \t]*\{\.\.\.props\}/
// A brace list may run over several lines, as a long import of a part family does.
const IMPORT = /^import\s+(?!type\b)(?:[^\n{]*\{[^}]*\}[^\n]*|[^\n]*)$/gm
const SIGNATURE = /export default function \w+\(\s*(?:\{([^}]*)\})?[^)]*\)[^{]*\{/
const passThrough = (name: string) => new RegExp(`\\s+${name}=\\{${name}\\}`, 'g')
// A switch is tested in a brace of its own, or heads the whole tree: `{footer && ...}`, `render={interactive ? ... : undefined}`.
const switchTest = (name: string) => new RegExp(`\\{\\s*${name}\\s*(\\?|&&)\\s*`)
const switchHead = (name: string) => new RegExp(`^${name}\\s*\\?\\s*`)
// The docs stage's own branch: a Stage the demo draws open, which the reader's usage never takes.
const STAGE_BRANCH = /^if \(stage\) return <\w+[^\n]*\/>$/
/** The names an import line binds, `as` left out: a side-effect import binds none and is always kept. */
const bindingsOf = (line: string) => [...line.replace(/^import\s+/, '').replace(/\s+from\s+['"][^'"]+['"];?\s*$/, '').matchAll(/\w+/g)].map(([name]) => name).filter((name) => name !== 'as')

/** Where the last `return ` outside a template literal starts, so a code sample passed as a child never reads as the demo's return. */
function lastReturnOf(source: string): number {
  let found = -1
  let literal = false
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\\') i++
    else if (source[i] === '`') literal = !literal
    else if (!literal && source.startsWith('return ', i)) found = i
  }
  return found
}

/** Reads a dummy/playground.tsx whose default export only returns one JSX tree that spreads `props` or passes its props on by name. */
export function usageOf(source: string): Usage | null {
  const signature = SIGNATURE.exec(source)
  const start = lastReturnOf(source)
  const end = source.lastIndexOf('}')
  if (signature === null || start === -1 || end < start) return null
  // A hook or a constant before the return is state the snippet would lose, so such a demo shows its whole source.
  const before = source.slice(signature.index + signature[0].length, start).trim()
  if (before !== '' && !STAGE_BRANCH.test(before)) return null
  const body = source.slice(start + 'return '.length, end).trim().replace(/^\(\s*\n?/, '').replace(/\n?\s*\)$/, '')
  // A name with a default (`dismissible = true`) is passed on all the same.
  const passed = (signature[1] ?? '').split(',').map((name) => name.split('=')[0]?.trim() ?? '').filter((name) => /^\w+$/.test(name) && passThrough(name).test(body))
  const switches = Object.fromEntries((signature[1] ?? '').split(',').flatMap((param) => {
    const [name = '', start = ''] = param.split('=').map((part) => part.trim())
    return /^\w+$/.test(name) && !passed.includes(name) && (switchTest(name).test(body) || switchHead(name).test(body)) ? [[name, start === 'true']] : []
  }))
  if (!SPREAD.test(body) && passed.length === 0 && Object.keys(switches).length === 0) return null
  const lines = body.split('\n')
  // A line that opens inside a template literal is the sample's own text: its indent is not the tree's.
  const opensInLiteral = lines.map((_, index) => (lines.slice(0, index).join('\n').match(/`/g) ?? []).length % 2 === 1)
  const indents = lines.slice(1).filter((line, index) => line.trim() !== '' && !opensInLiteral[index + 1]).map((line) => /^ */.exec(line)?.[0].length ?? 0)
  // A multi-line tree's closing tag sits at the root's own indent, which the first line lost to the trim.
  const cut = indents.length > 0 ? Math.min(...indents) : 0
  const jsx = lines.map((line, index) => (index === 0 || opensInLiteral[index] ? line : line.slice(Math.min(cut, line.length - line.trimStart().length)))).join('\n')
  // A type the demo needs for its own props, or a name only its Stage uses, is not one the reader's usage needs.
  const imports = (source.match(IMPORT) ?? []).map((line) => line.replace(/,\s*type \w+/g, '').replace(/\{\s*type \w+,\s*/, '{ '))
    .filter((line) => bindingsOf(line).length === 0 || bindingsOf(line).some((name) => new RegExp(`\\b${name}\\b`).test(jsx)))
  return Object.keys(switches).length === 0 ? { imports, jsx, passed } : { imports, jsx, passed, switches }
}

/** The offset of the brace that closes the one at `open`. */
function braceEnd(text: string, open: number): number {
  let depth = 0
  for (let at = open; at < text.length; at += 1) {
    if (text[at] === '{') depth += 1
    else if (text[at] === '}') {
      depth -= 1
      if (depth === 0) return at
    }
  }
  return text.length
}

/** A test's two branches, split at its own ` : ` outside every bracket; `&&` has no second branch. */
function branchesOf(rest: string, operator: string): [string, string] {
  if (operator === '&&') return [rest, '']
  let depth = 0
  for (let at = 0; at < rest.length; at += 1) {
    const char = rest[at] ?? ''
    if ('({['.includes(char)) depth += 1
    else if (')}]'.includes(char)) depth -= 1
    else if (depth === 0 && char === ':' && /\s/.test(rest[at - 1] ?? '') && /\s/.test(rest[at + 1] ?? '')) return [rest.slice(0, at), rest.slice(at + 1)]
  }
  return [rest, '']
}

/** A branch as written, its brackets and a fragment taken off and its lines dedented to the given indent; '' when it draws nothing. */
function branchText(branch: string, indent: string): string {
  let text = branch.trim()
  if (text.startsWith('(') && braceLike(text) === text.length - 1) text = text.slice(1, -1).trim()
  if (text.startsWith('<>') && text.endsWith('</>')) text = text.slice(2, -3).trim()
  if (text === 'null' || text === 'undefined' || text === 'false') return ''
  const lines = text.split('\n')
  const cut = Math.min(...lines.slice(1).filter((line) => line.trim() !== '').map((line) => /^ */.exec(line)?.[0].length ?? 0))
  return lines.map((line, index) => (index === 0 ? line : `${indent}${line.slice(Number.isFinite(cut) ? cut : 0)}`)).join('\n')
}

/** The offset of the bracket that closes the opening one at 0. */
function braceLike(text: string): number {
  let depth = 0
  for (let at = 0; at < text.length; at += 1) {
    if (text[at] === '(') depth += 1
    else if (text[at] === ')') {
      depth -= 1
      if (depth === 0) return at
    }
  }
  return -1
}

/** The tree with every test of a switch replaced by the branch its value picks: a child, an attribute's value, or the whole tree. */
function resolveSwitch(jsx: string, name: string, value: boolean): string {
  const head = switchHead(name).exec(jsx)
  if (head !== null) {
    const [yes, no] = branchesOf(jsx.slice(head[0].length), '?')
    return branchText(value ? yes : no, '')
  }
  let tree = jsx
  for (let found = switchTest(name).exec(tree); found !== null; found = switchTest(name).exec(tree)) {
    const open = found.index
    const close = braceEnd(tree, open)
    const [yes, no] = branchesOf(tree.slice(open + found[0].length, close), found[1] ?? '')
    const lineStart = tree.lastIndexOf('\n', open) + 1
    const indent = /^[ \t]*/.exec(tree.slice(lineStart))?.[0] ?? ''
    const chosen = branchText(value ? yes : no, indent)
    if (tree[open - 1] === '=') {
      // An attribute: its value is the branch, and a branch that draws nothing takes the attribute with it.
      const attribute = /\s+[\w-]+=$/.exec(tree.slice(0, open))
      const from = attribute === null ? open : attribute.index
      tree = chosen === '' ? `${tree.slice(0, from)}${tree.slice(close + 1)}` : `${tree.slice(0, open)}{${chosen}}${tree.slice(close + 1)}`
    } else if (chosen === '' && tree.slice(lineStart, open).trim() === '' && /^[ \t]*(\n|$)/.test(tree.slice(close + 1))) {
      // A child alone on its line goes with its line.
      const lineEnd = tree.indexOf('\n', close)
      tree = `${tree.slice(0, Math.max(lineStart - 1, 0))}${lineEnd === -1 ? '' : tree.slice(lineEnd)}`
    } else tree = `${tree.slice(0, open)}${chosen}${tree.slice(close + 1)}`
  }
  return tree
}

/** An import line keeping only the names the tree still uses: a branch Try it turned off takes its parts with it. */
function importUsedBy(line: string, jsx: string): string {
  const list = /\{([^}]*)\}/.exec(line)
  const used = (name: string) => new RegExp(`\\b${name}\\b`).test(jsx)
  if (list === null) return bindingsOf(line).some(used) ? line : ''
  const names = (list[1] ?? '').split(',').map((name) => name.trim()).filter((name) => name !== '' && used(name.split(/\s+as\s+/).at(-1) ?? name))
  return names.length === 0 ? '' : line.replace(list[0], `{ ${names.join(', ')} }`)
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

/** The tag that holds the spread without its own value of a prop the spread now writes, bare or literal. */
function withoutSpreadOwn(jsx: string, name: string): string {
  const at = jsx.search(SPREAD)
  if (at < 0) return jsx
  const start = jsx.lastIndexOf('<', at)
  // Quotes and braces blanked to the same length, so a class word or an expression never matches.
  const blank = jsx.slice(start, at).replace(/"[^"]*"|\{[^{}]*\}/g, (part) => `${part[0] ?? ''}${' '.repeat(part.length - 2)}${part.at(-1) ?? ''}`)
  const match = new RegExp(`\\s+${name}(?:=(?:\\{\\s*\\}|"\\s*"))?(?=[\\s/>]|$)`).exec(blank)
  if (match === null) return jsx
  const from = start + match.index
  return `${jsx.slice(0, from)}${jsx.slice(from + match[0].length)}`
}

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
  const switches = usage.switches ?? {}
  const picked = { ...switches, ...Object.fromEntries(props.filter(([name]) => name in switches)) }
  let jsx = Object.entries(picked).reduce((tree, [name, value]) => resolveSwitch(tree, name, value === true), usage.jsx)
  const spread: string[] = []
  // A part's prop whose part sat in a branch the switches left out has nowhere to go.
  const placed = props.filter(([name]) => !(name in switches) && !(usage.passed.includes(name) && !passThrough(name).test(jsx)))
  for (const [name, value] of placed) {
    const attribute = ` ${attributeOf(name, value)}`
    const root = rootTagOf(jsx)
    const literal = [...root.matchAll(attributeNamed(name))][0]
    if (passThrough(name).test(jsx)) jsx = jsx.replace(passThrough(name), attribute)
    else if (literal === undefined) {
      jsx = withoutSpreadOwn(jsx, name)
      spread.push(attribute)
    }
    else {
      // The blanked tag keeps every offset, so the match's place in it is its place in the tree.
      const start = literal.index + (literal[1]?.length ?? 0)
      const length = literal[0].length - (literal[1]?.length ?? 0)
      jsx = `${jsx.slice(0, start)}${attributeOf(name, value)}${jsx.slice(start + length)}`
    }
  }
  jsx = usage.passed.reduce((tree, name) => tree.replace(passThrough(name), ''), jsx)
  // A spread on a line of its own goes with its line when nothing takes its place.
  if (spread.length === 0) jsx = jsx.replace(/\n[ \t]*\{\.\.\.props\}(?=\n)/, '')
  else jsx = jsx.replace(/^([ \t]*)\{\.\.\.props\}$/m, (_, indent: string) => spread.map((attribute) => `${indent}${attribute.trim()}`).join('\n'))
  // A pass-through on a line of its own goes with its line.
  jsx = jsx.replace(/\n[ \t]*(\w+)=\{\1\}(?=\n)/g, '').replace(/[ \t]+(\w+)=\{\1\}/g, '').replace(SPREAD, spread.join(''))
  const imports = Object.keys(switches).length === 0 ? usage.imports : usage.imports.map((line) => importUsedBy(line, jsx)).filter((line) => line !== '')
  return imports.length > 0 ? `${imports.join('\n')}\n\n${jsx}` : jsx
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
