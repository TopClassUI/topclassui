import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'timeline')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `timeline-probe-${name}.tsx`))

const PRELUDE = [
  "import { check } from '#icons/data/check.js'",
  "import { Svg } from '#components/svg/index.js'",
  "import { getLabels } from '#shared/labels/get-labels.js'",
  "import { Timeline } from '../index.js'",
  'declare const failed: boolean',
  "const rows = [{ id: 7, title: 'Created' }]",
  'void [check, Svg, getLabels, Timeline, failed, rows]',
].join('\n')

/** The part of the README a person writes, and the tsx fences in it as a reader copies them. */
const HAND = /<!-- hand-written -->([\s\S]*)<!-- \/hand-written -->/.exec(readFileSync(join(FOLDER, 'README.md'), 'utf8'))?.[1] ?? ''
const SAMPLES = [...HAND.matchAll(/```tsx\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\nexport const probe = (\n${code}\n)\n`]))

  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  host.getSourceFile = (name, language, ...rest) => {
    const code = probes.get(slash(name))
    return code === undefined ? getSourceFile(name, language, ...rest) : ts.createSourceFile(name, code, language)
  }
  host.fileExists = (name) => probes.has(slash(name)) || fileExists(name)
  host.readFile = (name) => probes.get(slash(name)) ?? readFile(name)

  const program = ts.createProgram([...probes.keys()], options, host)
  const out: Record<string, string[]> = {}
  for (const name of Object.keys(snippets)) {
    out[name] = ts.getPreEmitDiagnostics(program, program.getSourceFile(probePath(name)))
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  }
  return out
}

const ONE = "items={[{ id: 'a', title: 'Created', status: 'done' }]} getKey={(event) => event.id}"

const verdict = compile({
  sample: SAMPLES[0] ?? 'the README has no sample',
  arabic: `<Timeline ${ONE} labels={getLabels('ar').labels} />`,
  conditionalIcon: "<Timeline items={[{ id: 'a', title: 'Failed', icon: failed && <Svg icon={check} size=\"xs\" /> }]} getKey={(event) => event.id} />",
  numberKey: '<Timeline items={rows} getKey={(row) => row.id} />',
  stringKey: '<Timeline items={rows} getKey={(row) => String(row.id)} />',
})

describe('what the README tells a reader to write compiles', () => {
  it('holds one sample to copy, with a status, a time and getKey', () => {
    expect(SAMPLES).toHaveLength(1)
    expect(SAMPLES[0]).toContain("{ id: 'placed', title: 'Order placed', time: '2 October, 09:12', status: 'done' }")
    expect(SAMPLES[0]).toContain('getKey={(event) => event.id}')
  })

  it('compiles that sample as written, the item type inferred from the list', () => {
    expect(verdict['sample']).toEqual([])
  })

  it('compiles the Arabic labels line it names', () => {
    expect(HAND).toContain("`labels={getLabels('ar').labels}`")
    expect(verdict['arabic']).toEqual([])
  })

  it('compiles an icon behind a condition, which leaves false when the condition is', () => {
    expect(verdict['conditionalIcon']).toEqual([])
  })

  it('refuses a numeric key and takes String(row.id), as the getKey line says', () => {
    expect(HAND).toContain('write `String(row.id)` for a numeric id')
    // The message, not a count: a program that fails for any other reason also has errors.
    expect((verdict['numberKey'] ?? []).join(' ')).toContain("Type 'number' is not assignable to type 'string'")
    expect(verdict['stringKey']).toEqual([])
  })
})
