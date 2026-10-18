import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/** R-13-1: the direction comes from the layout, never from the page's dir, which the server render cannot see.
 * The provider's development check that the two agree is the one read allowed. */
const SRC = join(process.cwd(), 'src')

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) { if (e.name !== 'test') walk(p, out) }
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

const withoutComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
const relative = (file: string) => file.slice(SRC.length + 1).split('\\').join('/')

const READS = [
  /\bdocument\s*\.\s*dir\b/g,
  /\bdocumentElement\s*\.\s*dir\b/g,
  /\.getAttribute\(\s*['"`]dir['"`]\s*\)/g,
  /\.closest\(\s*['"`][^'"`]*\[dir\b/g,
  /\.matches\(\s*['"`][^'"`]*:dir\(/g,
  /\bgetComputedStyle\([^)]*\)\s*\.\s*direction\b/g,
  /\{[^}]*\bdirection\b[^}]*\}\s*=\s*(?:\w+\.)?getComputedStyle\(/g,
]

/** Every read of the page's direction in the code: the patterns above, and `.direction` off a computed style held in a name. */
function readsOfPageDir(code: string): string[] {
  const clean = withoutComments(code)
  const styles = [...clean.matchAll(/\b(\w+)\s*=\s*(?:\w+\.)?getComputedStyle\(/g)].flatMap((m) => (m[1] === undefined ? [] : [m[1]]))
  const held = styles.map((name) => new RegExp(`\\b${name}\\s*\\.\\s*direction\\b`, 'g'))
  return [...READS, ...held].flatMap((re) => clean.match(re) ?? [])
}

describe('the check that catches a read of the page dir', () => {
  it('catches every form', () => {
    expect(readsOfPageDir('const a = document.dir')).toEqual(['document.dir'])
    expect(readsOfPageDir('if (document.documentElement.dir === "rtl") {}')).toEqual(['documentElement.dir'])
    expect(readsOfPageDir("node.getAttribute('dir')")).toEqual([".getAttribute('dir')"])
    expect(readsOfPageDir("node.closest('[dir]')")).toEqual([".closest('[dir"])
    expect(readsOfPageDir("node.matches(':dir(rtl)')")).toEqual([".matches(':dir("])
    expect(readsOfPageDir('getComputedStyle(node).direction')).toEqual(['getComputedStyle(node).direction'])
    expect(readsOfPageDir('const { direction } = window.getComputedStyle(node)')).toEqual(['{ direction } = window.getComputedStyle('])
    expect(readsOfPageDir('const style = getComputedStyle(node)\nif (style.direction) {}')).toEqual(['style.direction'])
  })

  it('leaves a write, a comment and a context read alone', () => {
    expect(readsOfPageDir('<div dir={select.dir} />')).toEqual([])
    expect(readsOfPageDir('// never read from document.dir in an effect')).toEqual([])
    expect(readsOfPageDir('const { direction } = useTopClass()')).toEqual([])
    expect(readsOfPageDir('const style = getComputedStyle(node)\nstyle.paddingTop')).toEqual([])
  })
})

describe('no library file reads the page dir (R-13-1)', () => {
  const files = walk(SRC)
  const reads = files.flatMap((file) => readsOfPageDir(readFileSync(file, 'utf8')).map((read) => `${relative(file)}: ${read}`))

  it('walks the whole of src', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('finds only the provider comparing its direction with <html dir>, in development', () => {
    expect(reads).toEqual(['shared/provider/use-provider-locale.ts: documentElement.dir'])
  })
})
