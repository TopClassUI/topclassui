// pnpm harness:build - writes one static page per demo, mode and direction.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import type { ComponentType } from 'react'

import { DIRECTIONS, MODES, candidatesIn, compileCss, pageHtml, pageName } from './lib/harness.js'

const ROOT = process.cwd()
const OUT = join(ROOT, '.harness')
const COMPONENTS = join(ROOT, 'src', 'components')

const folders = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory() && readdirSync(join(COMPONENTS, e.name)).includes('dummy'))
  .map((e) => e.name)

const demos: Array<{ name: string; body: string }> = []

for (const folder of folders) {
  const dir = join(COMPONENTS, folder, 'dummy')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort()) {
    // A file URL, or Node rejects a Windows path: 'Received protocol c:'.
    const loaded = await import(pathToFileURL(join(dir, file)).href) as { default: ComponentType }
    demos.push({ name: `${folder}--${file.slice(0, -4)}`, body: renderToStaticMarkup(<loaded.default />) })
  }
}

if (demos.length === 0) throw new Error('harness: no demos found, so there is nothing to measure')

// One stylesheet for every page: the classes are the union of what the demos emit.
const css = await compileCss(ROOT, [
  ...new Set(demos.flatMap((d) => candidatesIn(d.body))),
  'bg-page', 'text-body', 'p-8', 'sr-only',
])

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

let written = 0
for (const demo of demos) {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      const html = pageHtml({ mode, direction, demo: demo.name, body: demo.body }, css)
      writeFileSync(join(OUT, pageName(demo.name, mode, direction)), html)
      written++
    }
  }
}

writeFileSync(join(OUT, 'pages.json'), JSON.stringify(demos.map((d) => d.name), null, 2))
console.log(`harness: ${String(written)} pages from ${String(demos.length)} demos`)
