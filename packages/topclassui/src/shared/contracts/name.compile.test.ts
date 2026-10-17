import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'shared', 'contracts')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, `name-probe-${name}.ts`))

const PRELUDE = "import type { ControlName, GroupName } from './name.js'\nexport type Seen = ControlName | GroupName"

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

/** A name written in place, the way a page writes it. */
const control = (fields: string) => `export const probe: ControlName = { ${fields} }`
const group = (fields: string) => `export const probe: GroupName = { ${fields} }`

/** A name held in a variable first, so the verdict is assignability and not a literal's excess-property check. */
const held = (type: string, fields: string) => `declare const held: { ${fields} }\nexport const probe: ${type} = held`

const verdict = compile({
  byId: control("id: 'email'"),
  byLabel: control("'aria-label': 'Email'"),
  byLabelledby: control("'aria-labelledby': 'email-label'"),
  byAll: control("id: 'email', 'aria-label': 'Email', 'aria-labelledby': 'email-label'"),
  controlNone: control(''),
  controlMaybeId: held('ControlName', 'id: string | undefined'),
  controlAllOptional: held('ControlName', "id?: string; 'aria-label'?: string; 'aria-labelledby'?: string"),
  groupLabel: group("'aria-label': 'Plan'"),
  groupLabelledby: group("'aria-labelledby': 'plan-label'"),
  groupBoth: group("'aria-label': 'Plan', 'aria-labelledby': 'plan-label'"),
  groupNone: group(''),
  groupById: held('GroupName', 'id: string'),
  groupMaybeLabel: held('GroupName', "'aria-label': string | undefined"),
  props: "type Props = { size?: 'md' } & ControlName\nexport const probe: Props = { size: 'md' }",
  omitted: "type Props = { size?: 'md' } & ControlName\nexport const probe: Omit<Props, 'size'> = {}",
})

const said = (name: string) => (verdict[name] ?? ['the probe did not compile at all']).join(' ')

describe('ControlName: a control is named by an id, an aria-label or an aria-labelledby', () => {
  it('compiles each of the three alone, and all three together', () => {
    expect(verdict['byId']).toEqual([])
    expect(verdict['byLabel']).toEqual([])
    expect(verdict['byLabelledby']).toEqual([])
    expect(verdict['byAll']).toEqual([])
  })

  it('does not compile with none of them, written in place or held with all three optional', () => {
    expect(said('controlNone')).toContain("is not assignable to type 'ControlName'")
    expect(said('controlAllOptional')).toContain("is not assignable to type 'ControlName'")
  })

  it('does not compile when its one name may be undefined, which would leave it with none', () => {
    expect(said('controlMaybeId')).toContain("is not assignable to type 'ControlName'")
  })

  it('refuses the props of a control that carry no name', () => {
    expect(said('props')).toContain("is not assignable to type 'Props'")
  })
})

describe('GroupName: a group is named by an aria-label or an aria-labelledby, never by an id', () => {
  it('compiles each of the two alone, and both together', () => {
    expect(verdict['groupLabel']).toEqual([])
    expect(verdict['groupLabelledby']).toEqual([])
    expect(verdict['groupBoth']).toEqual([])
  })

  it('does not compile with none of them, or with a name that may be undefined', () => {
    expect(said('groupNone')).toContain("is not assignable to type 'GroupName'")
    expect(said('groupMaybeLabel')).toContain("is not assignable to type 'GroupName'")
  })

  it('refuses an id alone: no <label htmlFor> can name a group', () => {
    expect(said('groupById')).toContain("is not assignable to type 'GroupName'")
  })
})

describe('the trap every README of a named control warns about', () => {
  it('Omit merges the arms into one where no name is required, so an unnamed control compiles', () => {
    expect(verdict['omitted']).toEqual([])
  })
})
