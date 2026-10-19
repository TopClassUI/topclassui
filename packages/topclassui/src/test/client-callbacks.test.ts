import { join, relative, sep } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { trackedFiles } from '../../scripts/lib/tracked-files.js'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')
const CLIENT_ONLY = /client|server action/i

const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
// Tracked files only: a folder a build or a branch switch left behind is not a component.
const indexes = trackedFiles(COMPONENTS).filter((path) => /^[^/]+\/index\.tsx$/.test(relative(COMPONENTS, path).split(sep).join('/')))

/** A key we declare in src/ whose type takes a call; ref is R-5.7-3's, and React's and Base UI's keys are theirs to document. */
function isOwnCallback(checker: ts.TypeChecker, key: ts.Symbol, at: ts.Node): boolean {
  const declarations = key.getDeclarations() ?? []
  if (declarations.length === 0 || declarations.some((node) => node.getSourceFile().fileName.includes('node_modules'))) return false
  const type = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(key, at))
  return (type.isUnion() ? type.types : [type]).some((member) => member.getCallSignatures().length > 0)
}

/** `slug: Export.key` for each callback of a client.js re-export whose JSDoc never says client-only or Server Action. */
function undocumented(files: readonly string[], host?: ts.CompilerHost): string[] {
  const program = ts.createProgram(files, options, host)
  const checker = program.getTypeChecker()
  const out: string[] = []
  for (const file of files) {
    const source = program.getSourceFile(file)
    const module = source && checker.getSymbolAtLocation(source)
    if (!source || !module) continue
    const fromClient = new Set(source.statements.filter(ts.isExportDeclaration)
      .filter((node) => node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === './client.js')
      .flatMap((node) => (node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : []))
      .map((element) => element.name.text))
    for (const exported of checker.getExportsOfModule(module).filter((symbol) => fromClient.has(symbol.name))) {
      const props = checker.getTypeOfSymbolAtLocation(exported, source).getCallSignatures()[0]?.getParameters()[0]
      if (!props) continue
      for (const key of checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(props, source))) {
        if (key.name === 'ref' || !isOwnCallback(checker, key, source)) continue
        if (!CLIENT_ONLY.test(ts.displayPartsToString(key.getDocumentationComment(checker)))) {
          out.push(`${source.fileName.split('/').at(-2) ?? ''}: ${exported.name}.${key.name}`)
        }
      }
    }
  }
  return out.sort()
}

/** A host that also serves the given files from memory, so a fixture needs nothing on disk. */
function withFiles(given: Record<string, string>): ts.CompilerHost {
  // TypeScript asks the host with forward-slash paths on every platform, so the keys use them too.
  const files = Object.fromEntries(Object.entries(given).map(([name, code]) => [name.split(sep).join('/'), code]))
  const host = ts.createCompilerHost(options)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  const getSourceFile = host.getSourceFile.bind(host)
  const folders = new Set(Object.keys(files).map((name) => name.slice(0, name.lastIndexOf('/'))))
  host.directoryExists = (name) => folders.has(name) || ts.sys.directoryExists(name)
  host.fileExists = (name) => name in files || fileExists(name)
  host.readFile = (name) => files[name] ?? readFile(name)
  host.getSourceFile = (name, language, ...rest) => {
    const code = files[name]
    return code === undefined ? getSourceFile(name, language, ...rest) : ts.createSourceFile(name, code, language, true)
  }
  return host
}

describe('a callback of a client export says it is client-only or a Server Action (PLAN 9.2 rule 4, R-5.1-3)', () => {
  it('reads the client re-exports of every index.tsx, so an empty walk cannot pass', () => {
    expect(indexes.length).toBeGreaterThan(40)
  })

  it('names a callback with no note, on a fixture, and passes a noted one, ref and data', () => {
    const folder = join(COMPONENTS, 'probe-fixture')
    const host = withFiles({
      [join(folder, 'index.tsx')]: "export { Probe } from './client.js'\nexport { Shared } from './shared.js'\n",
      [join(folder, 'client.tsx')]: [
        "'use client'",
        'interface ProbeProps {',
        '  /** Called on a press. Client-only. */',
        '  onA?: () => void',
        '  /** Called on a press. */',
        '  onB?: () => void',
        '  ref?: () => void',
        '  label: string',
        '}',
        'export function Probe(_: ProbeProps) { return null }',
      ].join('\n'),
      [join(folder, 'shared.tsx')]: 'export function Shared(_: { onC: () => void }) { return null }',
    })
    expect(undocumented([join(folder, 'index.tsx')], host)).toEqual(['probe-fixture: Probe.onB'])
  })

  it('finds no callback without that note', () => {
    expect(undocumented(indexes)).toEqual([])
  })
})
