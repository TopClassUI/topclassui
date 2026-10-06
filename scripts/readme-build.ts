// pnpm readme:build writes a README.md per component; --check fails when one is stale,
// the same contract pnpm check:icons holds for the generated icon modules.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

import { z } from 'zod'

import type { ComponentMeta } from '../src/shared/meta.js'
import type { JsonSchemaObject } from './lib/readme.js'
import { handWrittenOf, mergeRows, renderReadme, rowsFromJsonSchema } from './lib/readme.js'
import { openTypeProgram, ownPropsOf } from './lib/readme-types.js'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')
const check = process.argv.includes('--check')
const rel = (p: string) => relative(ROOT, p).split(sep).join(posix.sep)
const firstOf = <T,>(a: T[], b: T[]) => (a.length > 0 ? a : b)

const folders = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()

const typeFiles = folders
  .map((slug) => join(COMPONENTS, slug, 'types.ts'))
  .filter((f) => existsSync(f))
const program = openTypeProgram(ROOT, typeFiles)

const stale: string[] = []
let written = 0

for (const slug of folders) {
  const dir = join(COMPONENTS, slug)
  // pathToFileURL, not a hand-built file:// string: a Windows path or a space breaks that.
  const metaModule = (await import(pathToFileURL(join(dir, 'meta.ts')).href)) as { meta: ComponentMeta }
  const meta = metaModule.meta

  const schemaFile = join(dir, 'schema.ts')
  let fromSchema: ReturnType<typeof rowsFromJsonSchema> = []

  if (existsSync(schemaFile)) {
    const loaded = (await import(pathToFileURL(schemaFile).href)) as Record<string, unknown>
    const schema = Object.values(loaded).find((v) => v instanceof z.ZodType)
    if (schema) {
      // zod types the payload generically; the fields the table needs are a subset.
      const json = z.toJSONSchema(schema, { io: 'input' }) as JsonSchemaObject
      fromSchema = rowsFromJsonSchema(json)
    }
  }

  // A component split into parts names its root <Name>Root (R-9.2-4), so its props are
  // <Name>RootProps. Without this fallback every multi-part README would silently lose
  // its required column.
  const typeFile = join(dir, 'types.ts')
  const fromTypes = existsSync(typeFile)
    ? firstOf(ownPropsOf(program, typeFile, `${meta.name}Props`), ownPropsOf(program, typeFile, `${meta.name}RootProps`))
    : []

  const demoDir = join(dir, 'dummy')
  const demos = existsSync(demoDir)
    ? readdirSync(demoDir).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, '')).sort()
    : []

  const target = join(dir, 'README.md')
  const existing = existsSync(target) ? readFileSync(target, 'utf8') : null
  const next = renderReadme({
    meta,
    props: mergeRows(fromSchema, fromTypes),
    demos,
    handWritten: handWrittenOf(existing),
  })

  if (existing === next) continue
  if (check) stale.push(rel(target))
  else {
    writeFileSync(target, next)
    written += 1
  }
}

if (check && stale.length > 0) {
  for (const f of stale) console.error(`error ${f} is out of date. Run pnpm readme:build.`)
  console.error(`\nreadme: ${String(stale.length)} file${stale.length === 1 ? '' : 's'} stale.`)
  process.exit(1)
}

console.log(check
  ? `readme: ok (${String(folders.length)} components)`
  : `readme: wrote ${String(written)} of ${String(folders.length)}`)
