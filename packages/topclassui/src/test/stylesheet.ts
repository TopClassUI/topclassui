// Tailwind's own resolver needs a bundler, so tests compile the entry by hand.
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { compile } from 'tailwindcss'

const ROOT = process.cwd()

/** The entry a consumer writes: Tailwind, then our tokens, then our components. */
export const ENTRY = '@import "tailwindcss";\n@import "./src/tokens.css";\n@import "./src/styles.css";\n'

export function loadStylesheet(id: string, base: string) {
  const file = id === 'tailwindcss'
    ? join(ROOT, 'node_modules', 'tailwindcss', 'index.css')
    : resolve(base, id)
  return Promise.resolve({ path: file, base: dirname(file), content: readFileSync(file, 'utf8') })
}

export function compileEntry(entry = ENTRY) {
  return compile(entry, { base: ROOT, loadStylesheet })
}

/** Where a declaration first appears, so a test can say which rule the browser takes. */
export function declarationIndex(css: string, selector: string, property: string): number {
  const at = css.indexOf(selector)
  if (at === -1) return -1
  const next = css.indexOf(property, at)
  return next === -1 || next > css.indexOf('}', at) ? -1 : next
}
