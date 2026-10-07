// A real page per demo, with the real compiled stylesheet, so a browser can
// measure what a consumer would see. The docs app will replace this; until then
// it is the only place the CSS and the markup meet (PLAN 17.1).
import { readFileSync } from 'node:fs'
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

export interface Page { mode: Mode; direction: Direction; demo: string; body: string }

export function pageHtml({ mode, direction, demo, body }: Page, css: string): string {
  const lang = direction === 'rtl' ? 'ar' : 'en'
  return `<!doctype html>
<html lang="${lang}" dir="${direction}" data-theme="${mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${demo} - ${mode} - ${direction}</title>
<style>${css}</style>
</head>
<body class="bg-page text-body">
<h1 class="sr-only">${demo}</h1>
<main id="demo" class="p-8">${body}</main>
</body>
</html>
`
}

export const pageName = (demo: string, mode: Mode, direction: Direction) =>
  `${demo}--${mode}--${direction}.html`
