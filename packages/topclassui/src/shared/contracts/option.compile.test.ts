import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'shared', 'contracts')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, `option-probe-${name}.ts`))

const PRELUDE = [
  "import type { ReactElement } from 'react'",
  "import type { SelectRootProps } from '@base-ui/react/select'",
  "import type { ListOption } from './option.js'",
  'export type Seen = ListOption | ReactElement | SelectRootProps<string>',
].join('\n')

/** The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so no mutation could reach it. */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\n${code}\n`]))

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

/** An option written in place, the way a page writes it. */
const option = (fields: string) => `export const probe: ListOption = { ${fields} }`

/** An option held in a variable first, so the verdict is assignability and not a literal's excess-property check. */
const held = (fields: string) => `declare const held: { ${fields} }\nexport const probe: ListOption = held`

const verdict = compile({
  plain: option("value: 'jo', label: 'Jordan'"),
  disabled: option("value: 'jo', label: 'Jordan', disabled: true"),
  maybeDisabled: held('value: string; label: string; disabled: boolean | undefined'),
  noValue: option("label: 'Jordan'"),
  noLabel: option("value: 'jo'"),
  maybeLabel: held('value: string; label: string | undefined'),
  numberValue: option("value: 962, label: 'Jordan'"),
  nodeLabel: "declare const node: ReactElement\nexport const probe: ListOption = { value: 'jo', label: node }",
  handler: option("value: 'jo', label: 'Jordan', onSelect: () => undefined"),
  list: "export const probe: readonly ListOption[] = [{ value: 'jo', label: 'Jordan' }, { value: 'ps', label: 'Palestine', disabled: true }]",
  selectItems: "declare const list: readonly ListOption[]\nexport const probe: SelectRootProps<string>['items'] = list",
})

const said = (name: string) => (verdict[name] ?? ['the probe did not compile at all']).join(' ')

describe('ListOption: a value the form receives and a label the row shows', () => {
  it('compiles with the two, with disabled, with a disabled that may be undefined, and as a list', () => {
    expect(verdict['plain']).toEqual([])
    expect(verdict['disabled']).toEqual([])
    expect(verdict['maybeDisabled']).toEqual([])
    expect(verdict['list']).toEqual([])
  })

  it('does not compile without a value, or without a label', () => {
    expect(said('noValue')).toContain("Property 'value' is missing")
    expect(said('noLabel')).toContain("Property 'label' is missing")
  })

  it('does not compile when the label may be undefined, which would leave the trigger blank', () => {
    expect(said('maybeLabel')).toContain("is not assignable to type 'ListOption'")
  })

  it('takes a string value only, since that is what the form receives', () => {
    expect(said('numberValue')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('takes a string label only, since a query is matched against it', () => {
    expect(said('nodeLabel')).toContain("is not assignable to type 'string'")
  })

  it('is plain data: a handler on an option does not compile, so a Server Component can pass the list', () => {
    expect(said('handler')).toContain("'onSelect' does not exist in type 'ListOption'")
  })

  it('is a shape Base UI reads as it is: a list of options fits the items of Select.Root', () => {
    expect(verdict['selectItems']).toEqual([])
  })
})
