// Plan 3.5 step 3: the one file init edits without having created it. Lines are added, never moved or removed.
import { posix } from 'node:path'

const TAILWIND = /^[ \t]*@import\s+(?:url\()?\s*["']tailwindcss["'][^\n]*$/m

/** The two lines that pull tokens.css and styles.css into the CSS entry, relative from it. */
export function importLines(css: string, dir: string): string[] {
  let rel = posix.relative(posix.dirname(css), dir)
  if (!rel.startsWith('.')) rel = rel === '' ? '.' : `./${rel}`
  return [`@import "${rel}/tokens.css";`, `@import "${rel}/styles.css";`]
}

/** The entry with the two lines after its tailwindcss import; the import itself first when it has none. */
export function addImports(text: string, lines: string[]): { text: string; added: string[] } {
  const missing = lines.filter((line) => !text.split(/\r?\n/).some((l) => l.trim() === line))
  if (missing.length === 0) return { text, added: [] }
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const match = TAILWIND.exec(text)
  if (match === null) {
    const added = ['@import "tailwindcss";', ...missing]
    return { text: `${added.join(eol)}${eol}${text}`, added }
  }
  const at = match.index + match[0].length
  return { text: `${text.slice(0, at)}${eol}${missing.join(eol)}${text.slice(at)}`, added: missing }
}
