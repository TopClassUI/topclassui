// pnpm docs:data: the one door from the library into the site (docs-site S7). --strict fails on any issue; --out writes elsewhere.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import type { ExportsMap } from '../lib/rewrite-imports.js'
import { collect } from './lib/collect.js'
import { lastCommitDate, newestOf } from './lib/dates.js'
import { demoMapSource } from './lib/demo-map.js'
import { libraryFacts } from './lib/facts.js'
import { COMPONENTS, LIBRARY } from './lib/library.js'
import { PLANNED_EXPORTS } from './lib/planned-exports.js'
import { generatedProblems } from './lib/shape.js'
import { LOCALES, tocOf } from './lib/toc.js'

const APP = resolve(import.meta.dirname, '..')
const REPO = resolve(APP, '..', '..')
const CONTENT = join(APP, 'content')
const outFlag = process.argv.indexOf('--out')
const OUT = outFlag === -1 ? join(APP, '.generated') : resolve(process.argv[outFlag + 1] ?? '.generated')
const strict = process.argv.includes('--strict')

const manifest = JSON.parse(readFileSync(join(LIBRARY, 'package.json'), 'utf8')) as { exports?: ExportsMap }
// The release's R5 writes the real map; until it lands, the plan's map stands in for it.
const exportsMap = manifest.exports ?? PLANNED_EXPORTS

const { file, dates, issues } = await collect(join(CONTENT, 'components'), exportsMap, REPO)
const toc = tocOf(CONTENT)
const pageNames = [...new Set(LOCALES.flatMap((locale) => Object.keys(toc[locale])))].sort()
const pageDates = Object.fromEntries(pageNames.map((page) => [
  page,
  newestOf([lastCommitDate(LOCALES.map((locale) => join(CONTENT, locale, `${page}.mdx`)), REPO)]),
]))
const demos = demoMapSource(file.components.flatMap((entry) => entry.demos.map((demo) => ({ slug: entry.slug, name: demo.name }))))
const generated = { components: file, toc, dates: { components: dates, pages: pageDates }, demos }

const problems = generatedProblems(generated, (key) => {
  const [slug = '', name = ''] = key.split('/')
  return existsSync(join(COMPONENTS, slug, 'dummy', `${name}.tsx`))
})
if (problems.length > 0) {
  for (const problem of problems) console.error(`error ${problem}`)
  console.error(`\ndocs:data: ${String(problems.length)} shape problem${problems.length === 1 ? '' : 's'}; nothing written.`)
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'components.json'), `${JSON.stringify(generated.components, null, 2)}\n`)
writeFileSync(join(OUT, 'toc.json'), `${JSON.stringify(generated.toc, null, 2)}\n`)
writeFileSync(join(OUT, 'dates.json'), `${JSON.stringify(generated.dates, null, 2)}\n`)
writeFileSync(join(OUT, 'demos.ts'), demos)
writeFileSync(join(OUT, 'library.json'), `${JSON.stringify(libraryFacts(), null, 2)}\n`)

for (const issue of issues) console.warn(`${strict ? 'error' : 'warn'} ${issue.slug} ${issue.kind}: ${issue.detail}`)
const demoCount = file.components.reduce((sum, entry) => sum + entry.demos.length, 0)
const cards = file.components.filter((entry) => entry.card).length
console.log(`docs:data: ${String(file.components.length)} folders, ${String(cards)} catalog cards, ${String(demoCount)} demos, ${String(issues.length)} issue${issues.length === 1 ? '' : 's'}`)
if (strict && issues.length > 0) process.exit(1)
