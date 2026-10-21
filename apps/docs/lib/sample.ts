// THE CODE of a card as a reader would write it (job 127): no docs stage, no function wrapper around a tree that needs none.
import { cleanSourceOf } from './usage'

/** The body of `export default function` from its opening brace to the matching close, as offsets into the source. */
function bodyOf(source: string): { open: number; close: number } | null {
  const head = /export default function \w+\([^)]*(?:\)[^{]*)?\{/.exec(source)
  if (head === null) return null
  const open = head.index + head[0].length - 1
  let depth = 0
  for (let at = open; at < source.length; at += 1) {
    if (source[at] === '{') depth += 1
    else if (source[at] === '}') {
      depth -= 1
      if (depth === 0) return { open, close: at }
    }
  }
  return null
}

/** The offset just past the bracket that closes the one at `from`. */
function closeOf(text: string, from: number): number {
  const pairs: Record<string, string> = { '(': ')', '{': '}' }
  const opener = text[from] ?? ''
  const closer = pairs[opener] ?? ''
  let depth = 0
  for (let at = from; at < text.length; at += 1) {
    if (text[at] === opener) depth += 1
    else if (text[at] === closer) {
      depth -= 1
      if (depth === 0) return at + 1
    }
  }
  return text.length
}

/** Each `const name = (...)` or one-line `const name = <.../>` of a body, with the JSX it holds. */
function treesOf(body: string): Map<string, { start: number; end: number; jsx: string }> {
  const trees = new Map<string, { start: number; end: number; jsx: string }>()
  for (const found of body.matchAll(/^([ \t]*)const (\w+) = (\(|<)/gm)) {
    const [whole, , name = ''] = found
    const start = found.index
    const bracket = start + whole.length - 1
    if (whole.endsWith('(')) {
      const end = closeOf(body, bracket)
      trees.set(name, { start, end, jsx: body.slice(bracket + 1, end - 1).trim() })
    } else {
      const end = body.indexOf('\n', bracket)
      trees.set(name, { start, end: end === -1 ? body.length : end, jsx: body.slice(bracket, end === -1 ? undefined : end).trim() })
    }
  }
  return trees
}

const indentOf = (line: string) => /^[ \t]*/.exec(line)?.[0] ?? ''

/** A tree written in at an indent, every line of it: a fragment gives its children. */
function placed(jsx: string, indent: string): string {
  const fragment = /^<>\s*\n([\s\S]*)\n\s*<\/>$/.exec(jsx)
  const lines = (fragment?.[1] ?? jsx).split('\n')
  const rest = lines.slice(fragment === null ? 1 : 0).filter((line) => line.trim() !== '')
  const cut = rest.length === 0 ? 0 : Math.min(...rest.map((line) => indentOf(line).length))
  return lines.map((line, index) => `${indent}${index === 0 && fragment === null ? line.trim() : line.slice(Math.min(cut, indentOf(line).length))}`).join('\n')
}

/** The playground without its docs stage: the `stage` branch, the box it draws into and every `stage ? a : b`, so what is left is the demo a page writes. */
export function destage(source: string): string {
  if (!/\bstage = false\b/.test(source)) return source
  const range = bodyOf(source)
  if (range === null) return source
  let body = source.slice(range.open + 1, range.close)
  // The element the stage draws into, and the comment that explains it.
  body = body.replace(/^[ \t]*\/\/[^\n]*\n(?=[ \t]*const \[?root)/m, '').replace(/^[ \t]*const (?:root = useRef|\[root, setRoot\] = useState)[^\n]*\n/m, '')
  // The stage's own branch, as a block or as one line.
  for (let at = body.search(/if \(stage\) \{/); at !== -1; at = body.search(/if \(stage\) \{/)) {
    const lineStart = body.lastIndexOf('\n', at) + 1
    const end = closeOf(body, body.indexOf('{', at))
    body = body.slice(0, lineStart) + body.slice(end).replace(/^\n/, '')
  }
  body = body.replace(/^[ \t]*if \(stage\) return [^\n]*\n/m, '')
  // A demo that returns its tree unless it is the stage: that tree is the demo, and the box after it goes.
  const plain = /^([ \t]*)if \(!stage\) return (\w+)\n/m.exec(body)
  if (plain !== null) body = `${body.slice(0, plain.index)}${plain[1] ?? ''}return ${plain[2] ?? ''}\n`
  body = body
    .replace(/\s+[\w-]+=\{stage \? [^{}]*? : undefined\}/g, '')
    .replace(/\s+[\w-]+=\{stage\}/g, '')
    .replace(/\{stage \? null : ([^\n]*)\}(?=\n)/g, '$1')
    .replace(/([\w-]+)=\{stage \? [^{}]*? : ([^{}]*?)\}/g, '$1={$2}')
  // A demo that hands every other prop on with a rest spread hands none on once the stage is gone.
  if (/\{\s*stage = false,\s*\.\.\.props\s*\}/.test(source)) body = body.replace(/\.\.\.props,\s*/g, '')
  const signature = source.slice(0, range.open + 1).replace(/\{\s*stage = false,\s*\.\.\.props\s*\}/, '{}').replace(/,?\s*stage = false/, '').replace(/ & \{ stage\?: boolean \}/, '').replace(/\(\{\s*\}[^)]*\)/, '()')
  return `${signature}${body}${source.slice(range.close)}`
}

/** A demo whose body only names trees and returns one: the trees written into the return, so it is one tree. */
function inlined(source: string): string {
  const range = bodyOf(source)
  if (range === null) return source
  let body = source.slice(range.open + 1, range.close)
  const trees = treesOf(body)
  if (trees.size === 0) return source
  for (const tree of [...trees.values()].reverse()) body = body.slice(0, tree.start) + body.slice(tree.end).replace(/^\n/, '')
  for (const [name, tree] of trees) {
    body = body
      .replace(new RegExp(`^([ \\t]*)return ${name}$`, 'm'), (_, indent: string) => `${indent}return (\n${placed(tree.jsx, `${indent}  `)}\n${indent})`)
      .replace(new RegExp(`^([ \\t]*)\\{${name}\\}$`, 'gm'), (_, indent: string) => placed(tree.jsx, indent))
      .replace(new RegExp(`^([ \\t]*)(<[^\\n]*?>)\\{${name}\\}(<\\/[\\w.]+>)$`, 'gm'), (_, indent: string, open: string, close: string) => `${indent}${open}\n${placed(tree.jsx, `${indent}  `)}\n${indent}${close}`)
  }
  return `${source.slice(0, range.open + 1)}${body}${source.slice(range.close)}`
}

/** Where the top-level statement that starts at `start` ends: the first line break outside every bracket and string. */
function statementEnd(code: string, start: number): number {
  let depth = 0
  for (let at = start; at < code.length; at += 1) {
    const char = code[at] ?? ''
    if (char === '`' || char === "'" || char === '"') {
      const close = code.indexOf(char, at + 1)
      at = close === -1 ? code.length : close
    } else if ('([{'.includes(char)) depth += 1
    else if (')]}'.includes(char)) depth -= 1
    else if (char === '\n' && depth === 0) return at + 1
  }
  return code.length
}

/** The names a source declares at the top level besides its default export: a const or a function. */
const declared = (source: string) => [...source.matchAll(/^(?:const|function|interface) (\w+)/gm)].map((found) => found[1] ?? '')

/** Top-level declarations and imported names nothing uses any more, gone, each with its doc comment. */
function pruned(source: string): string {
  let code = source
  for (let changed = true; changed;) {
    changed = false
    for (const name of declared(code)) {
      const start = code.search(new RegExp(`^(?:const|function|interface) ${name}\\b`, 'm'))
      if (start === -1) continue
      const end = statementEnd(code, start)
      // A word of a class name, such as row in --tc-row-height, is not a use.
      if (new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(code.slice(0, start) + code.slice(end))) continue
      const comment = /(?:\/\/[^\n]*\n|\/\*\*[\s\S]*?\*\/\n)$/.exec(code.slice(0, start))
      code = code.slice(0, comment === null ? start : start - comment[0].length) + code.slice(end)
      changed = true
    }
  }
  code = code.replace(/^import \{([^}]*)\} from ('[^']*')\n/gm, (line: string, list: string, from: string) => {
    const kept = list.split(',').map((name) => name.trim()).filter((name) => name !== '')
      .filter((name) => (code.match(new RegExp(`\\b${name.split(' as ').at(-1) ?? name}\\b`, 'g'))?.length ?? 0) > 1)
    if (kept.length === 0) return ''
    return kept.length === list.split(',').filter((name) => name.trim() !== '').length ? line : `import { ${kept.join(', ')} } from ${from}\n`
  })
  if (!/\buse(?:State|Effect|Ref|Reducer|Memo|Callback)\b|on[A-Z]\w*=\{/.test(code)) code = code.replace(/^'use client'\n+/, '')
  return code.replace(/\n{3,}/g, '\n\n')
}

/** A function that only returns a tree, with no props: its imports, its constants and the tree, with no wrapper. */
function unwrapped(source: string): string {
  const range = bodyOf(source)
  if (range === null || source.startsWith("'use client'") || !/export default function \w+\(\)/.test(source)) return source
  const body = source.slice(range.open + 1, range.close).trim()
  if (!body.startsWith('return')) return source
  const tree = body.replace(/^return\s*/, '').replace(/^\(\s*\n?/, '').replace(/\n?\s*\)$/, '')
  const lines = tree.split('\n')
  const cut = Math.min(...lines.slice(1).filter((line) => line.trim() !== '').map((line) => indentOf(line).length))
  const jsx = lines.map((line, index) => (index === 0 ? line.trim() : line.slice(Number.isFinite(cut) ? Math.min(cut, indentOf(line).length) : 0))).join('\n')
  const head = source.slice(0, source.indexOf('export default function')).trimEnd()
  return `${head}\n\n${jsx}\n`
}

/** The playground with its stage gone and its trees written into the return, for usageOf to read. */
export const stagelessOf = (source: string): string => pruned(inlined(destage(source)))

/** THE CODE of a card from the source of its stage demo. */
export function sampleOf(source: string): string {
  return unwrapped(pruned(cleanSourceOf(inlined(destage(source)))))
}
