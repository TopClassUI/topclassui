// A real page per demo, with the real compiled stylesheet, so a browser can
// measure what a consumer would see. The docs app will replace this; until then
// it is the only place the CSS and the markup meet (PLAN 17.1).
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { compile } from 'tailwindcss'

export const MODES = ['light', 'dark', 'ocean'] as const
export const DIRECTIONS = ['ltr', 'rtl'] as const
export type Mode = (typeof MODES)[number]
export type Direction = (typeof DIRECTIONS)[number]

const ENTRY = '@import "tailwindcss";\n@import "./src/tokens.css";\n@import "./src/styles.css";\n'

/** Tailwind's own resolver needs a bundler; the entry only ever imports three files. */
function loadStylesheet(root: string) {
  return (id: string, base: string) => {
    const file = id === 'tailwindcss'
      ? join(root, 'node_modules', 'tailwindcss', 'index.css')
      : resolve(base, id)
    return Promise.resolve({ path: file, base: dirname(file), content: readFileSync(file, 'utf8') })
  }
}

/** Every class the rendered markup names, which is what Tailwind compiles against. */
export function candidatesIn(html: string): string[] {
  const found = new Set<string>()
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    for (const cls of (match[1] ?? '').split(/\s+/)) if (cls) found.add(cls)
  }
  return [...found]
}

export async function compileCss(root: string, candidates: readonly string[]): Promise<string> {
  const compiled = await compile(ENTRY, { base: root, loadStylesheet: loadStylesheet(root) })
  return compiled.build([...candidates])
}

export interface Demo { name: string; file: string }

/** Every dummy/*.tsx of every component folder, named `<folder>--<file>`: the one list both harnesses serve. */
export function findDemos(root: string): Demo[] {
  const components = join(root, 'src', 'components')
  return readdirSync(components, { withFileTypes: true })
    .filter((e) => e.isDirectory() && readdirSync(join(components, e.name)).includes('dummy'))
    .flatMap((e) => {
      const dir = join(components, e.name, 'dummy')
      return readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort()
        .map((f) => ({ name: `${e.name}--${f.slice(0, -4)}`, file: join(dir, f) }))
    })
}

/** The classes of the page itself, which no demo names. */
export const PAGE_CANDIDATES = ['bg-page', 'text-body', 'p-8', 'sr-only'] as const

/** The language each direction stands for: the page's `lang`, and the locale a live page gives the provider. */
export const LANG = { ltr: 'en', rtl: 'ar' } as const satisfies Record<Direction, string>

export interface Page { mode: Mode; direction: Direction; demo: string; body: string }

/** What the live harness adds around the same page; the static one passes nothing. */
export interface Shell { head?: string; bodyAttributes?: string; tail?: string }

export function pageHtml({ mode, direction, demo, body }: Page, css: string, shell: Shell = {}): string {
  const { head = '', bodyAttributes = '', tail = '' } = shell
  return `<!doctype html>
<html lang="${LANG[direction]}" dir="${direction}" data-theme="${mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${demo} - ${mode} - ${direction}</title>
<style>${css}</style>
${head}</head>
<body class="bg-page text-body"${bodyAttributes}>
<h1 class="sr-only">${demo}</h1>
<main id="demo" class="p-8">${body}</main>
${tail}</body>
</html>
`
}

export const pageName = (demo: string, mode: Mode, direction: Direction) =>
  `${demo}--${mode}--${direction}.html`
