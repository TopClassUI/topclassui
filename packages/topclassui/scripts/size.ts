// pnpm size - bundles every dist/components/<slug>/client.js with esbuild and writes size.json; --check holds it to size-budget.json.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'

import { build, version } from 'esbuild'

import {
  BASE_UI_EXTERNAL, type BudgetFile, KB, OWN_EXTERNAL, type Outputs, type SizeFile,
  budgetKbOf, budgetProblems, formatKb, ownSizes, runtimeChunkOf, staleProblems,
} from './lib/size.js'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'dist', 'components')
const SIZE_FILE = join(ROOT, 'size.json')
const BUDGET_FILE = join(ROOT, 'size-budget.json')
const check = process.argv.includes('--check')

if (!existsSync(COMPONENTS)) {
  console.error('size: dist/components is missing. Run pnpm build first.')
  process.exit(1)
}

const slugs = readdirSync(COMPONENTS).filter((slug) => existsSync(join(COMPONENTS, slug, 'client.js'))).sort()

async function measure(external: readonly string[]) {
  const result = await build({
    absWorkingDir: ROOT,
    entryPoints: Object.fromEntries(slugs.map((slug) => [slug, join('dist', 'components', slug, 'client.js')])),
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: [...external],
    outdir: 'size-out',
    write: false,
    metafile: true,
    logLevel: 'error',
  })
  const bytes = new Map(result.outputFiles.map((file) => [relative(ROOT, file.path).split('\\').join('/'), gzipSync(file.contents, { level: 9 }).length]))
  const outputs = result.metafile.outputs as Outputs
  return { outputs, gzipped: (path: string) => bytes.get(path) ?? 0 }
}

const own = await measure(OWN_EXTERNAL)
const withBaseUi = await measure(BASE_UI_EXTERNAL)
const ownBySlug = ownSizes(own.outputs, own.gzipped)
const baseUiBySlug = ownSizes(withBaseUi.outputs, withBaseUi.gzipped)
const runtime = runtimeChunkOf(own.outputs)

const fresh: SizeFile = {
  tool: `esbuild ${version}, ESM, minified, split, gzip level 9 per chunk`,
  runtimeBytes: runtime === null ? 0 : own.gzipped(runtime),
  components: Object.fromEntries(slugs.map((slug) => {
    const size = ownBySlug.get(slug)
    const total = baseUiBySlug.get(slug)
    if (size === undefined || total === undefined) throw new Error(`size: esbuild wrote no entry for ${slug}`)
    return [slug, { clientBytes: size.clientBytes, lazyBytes: size.lazyBytes, withBaseUiBytes: total.clientBytes, budgetedBytes: size.budgetedBytes }]
  })),
}

const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8')) as BudgetFile
console.log(`size: ${slugs.length} client entries, ${fresh.tool}; the class runtime (cn) is ${formatKb(fresh.runtimeBytes)}`)
const budgetOf = (slug: string) => {
  const rule = budget.components[slug]
  return rule === undefined ? 'none' : formatKb(budgetKbOf(rule, budget.kb) * KB)
}
console.table(Object.fromEntries(Object.entries(fresh.components).map(([slug, size]) => [slug, {
  own: formatKb(size.clientBytes),
  lazy: size.lazyBytes === 0 ? '' : formatKb(size.lazyBytes),
  'with Base UI': formatKb(size.withBaseUiBytes),
  budgeted: formatKb(size.budgetedBytes),
  budget: budgetOf(slug),
}])))

const problems = budgetProblems(fresh, budget)
if (check) {
  const committed = existsSync(SIZE_FILE) ? JSON.parse(readFileSync(SIZE_FILE, 'utf8')) as SizeFile : null
  if (committed === null) problems.push('size.json is missing. Run pnpm size.')
  else problems.push(...staleProblems(committed, fresh).map((problem) => `${problem} (run pnpm size)`))
} else {
  writeFileSync(SIZE_FILE, `${JSON.stringify(fresh, null, 2)}\n`)
  console.log('size: size.json written')
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`size: ${problem}`)
  process.exit(1)
}
console.log('size: every component is within its budget')
