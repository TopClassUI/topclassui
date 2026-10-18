import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'rating')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `rating-probe-${name}.tsx`))

const PRELUDE = "import { Rating, RatingInput } from '../index.js'\nexport const used = [Rating, RatingInput]"

/** The import line compiles as a module that uses what it imports, any other sample as JSX a page would paste. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Rating]\n`
  return `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`
}

/** The compiler's verdict, read at runtime, with only the probes as roots, as in a consumer's own program. */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) => [probePath(name), wrap(code)]))
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

/** Every code block a reader can copy out of the hand-written half of the README, in order. */
function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()

const verdict = compile({
  readmeImport: SAMPLES[0] ?? '<Missing />',
  readmeSample: SAMPLES[1] ?? '<Missing />',
  server: '<Rating value={3.5} max={10} size="xl" labels={undefined} locale="ar" id="r" className="gap-2" />',
  editing: '<Rating readOnly={false} aria-labelledby="t" name="stay" defaultValue={2} disabled />',
  input: '<RatingInput aria-labelledby="t" name="stay" defaultValue={2} disabled onValueChange={(next) => { void next.toFixed() }} />',
  handlerEditable: '<Rating readOnly={false} aria-label="S" onValueChange={(next) => { void next }} />',
  inputUnnamed: '<RatingInput defaultValue={2} />',
  unnamed: '<Rating readOnly={false} defaultValue={2} />',
  handlerReadOnly: '<Rating value={2} onValueChange={(next) => { void next }} />',
  nameReadOnly: '<Rating value={2} name="stay" />',
  children: '<Rating value={2}>Two</Rating>',
  stringValue: '<Rating value="4" />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toBe("import { Rating } from 'topclassui/rating'\n")
    expect(SAMPLES[1]).toContain('<Rating readOnly={false} name="stay" defaultValue={4} aria-label="Your stay" />')
  })

  it('the import line and the sample compile', () => {
    expect(verdict['readmeImport']).toEqual([])
    expect(verdict['readmeSample']).toEqual([])
  })
})

describe('what a Rating takes and refuses', () => {
  it('takes what a server page passes, and every editing prop with readOnly={false}', () => {
    expect(verdict['server']).toEqual([])
    expect(verdict['editing']).toEqual([])
  })

  it('takes a handler on RatingInput only: Rating takes no function (R-5.1-3)', () => {
    expect(verdict['input']).toEqual([])
    expect(verdict['handlerEditable']?.length).toBeGreaterThan(0)
    expect((verdict['inputUnnamed'] ?? []).join(' ')).toMatch(/aria-label/)
  })

  it('refuses an editing rating with no name for its group', () => {
    expect((verdict['unnamed'] ?? []).join(' ')).toMatch(/aria-label/)
  })

  it('refuses a handler or a field name on stars that only show a value', () => {
    expect(verdict['handlerReadOnly']?.length).toBeGreaterThan(0)
    expect(verdict['nameReadOnly']?.length).toBeGreaterThan(0)
  })

  it('refuses children and a string value', () => {
    expect((verdict['children'] ?? []).join(' ')).toContain('children')
    expect((verdict['stringValue'] ?? []).join(' ')).toContain("not assignable to type 'number'")
  })
})
