// One string-aware walk of a stylesheet. A regex parser gives a confidently wrong
// answer when a brace, a semicolon or a comment opener sits inside a quoted value.

export interface Declaration { property: string; value: string; line: number }
export interface Rule { prelude: string; ancestors: string[]; declarations: Declaration[]; line: number }
export interface Comment { line: number; span: number }
export interface Stylesheet { rules: Rule[]; comments: Comment[] }

const DECLARATION = /^\s*([-\w]+)\s*:\s*([\s\S]*?)\s*$/

/** Split on a separator that is not inside brackets, so :where(a, b) stays whole. */
export function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth = Math.max(0, depth - 1)
    else if (char === separator && depth === 0) { parts.push(text.slice(start, i)); start = i + 1 }
  }
  parts.push(text.slice(start))
  return parts
}

export function parseCss(css: string): Stylesheet {
  const rules: Rule[] = []
  const comments: Comment[] = []
  const stack: Rule[] = []
  let buffer = ''
  let bufferLine = 1
  let line = 1
  let depth = 0
  let i = 0

  const add = (char: string) => {
    if (!buffer.trim()) {
      if (!char.trim()) return
      bufferLine = line
    }
    buffer += char
  }

  const flush = () => {
    const text = buffer
    buffer = ''
    const m = DECLARATION.exec(text)
    const owner = stack[stack.length - 1]
    if (!m || !owner) return
    owner.declarations.push({ property: m[1] ?? '', value: m[2] ?? '', line: bufferLine })
  }

  while (i < css.length) {
    const char = css[i] ?? ''

    if (char === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const stop = end === -1 ? css.length : end + 2
      const span = css.slice(i, stop).split('\n').length
      comments.push({ line, span })
      line += span - 1
      i = stop
      continue
    }

    // Copied verbatim, so a brace or semicolon inside it is never read as syntax.
    if (char === '"' || char === "'") {
      let j = i + 1
      while (j < css.length) {
        if (css[j] === '\\') { j += 2; continue }
        if (css[j] === char) { j++; break }
        if (css[j] === '\n') line++
        j++
      }
      add(css.slice(i, j))
      i = j
      continue
    }

    if (char === '\n') { line++; add(' '); i++; continue }
    if (char === '(' || char === '[') { depth++; add(char); i++; continue }
    if (char === ')' || char === ']') { depth = Math.max(0, depth - 1); add(char); i++; continue }

    if (depth === 0 && char === '{') {
      const rule: Rule = {
        prelude: buffer.trim(),
        ancestors: stack.map((s) => s.prelude),
        declarations: [],
        line: bufferLine,
      }
      rules.push(rule)
      stack.push(rule)
      buffer = ''
      i++
      continue
    }

    // A closing brace flushes first, so a block's last declaration needs no semicolon.
    if (depth === 0 && char === '}') { flush(); stack.pop(); i++; continue }
    if (depth === 0 && char === ';') { flush(); i++; continue }

    add(char)
    i++
  }
  return { rules, comments }
}

/** `@layer base` matches `@layer`, `@layerx` does not. */
export function isAtRule(prelude: string, name: string): boolean {
  return prelude === name || prelude.startsWith(`${name} `) || prelude.startsWith(`${name}(`)
}
