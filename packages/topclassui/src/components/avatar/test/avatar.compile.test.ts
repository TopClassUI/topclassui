import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'avatar')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `avatar-probe-${name}.tsx`))

const PARTS = 'AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton'

/** The import block compiles as written; it carries a sample, so it is a module of its own. */
const wrap = (code: string) => `${importsFromRepo(code)}\nexport const used = [${PARTS}]\n`

/** The compiler's verdict per probe, read at runtime so a mutation can reach it. */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) => [probePath(name), code]))
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

function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()

/** A sample as a page pastes it: its import lines, then its JSX as an expression. */
function asModule(code: string): string {
  const lines = code.trimEnd().split('\n')
  const imports = lines.filter((line) => line.startsWith('import '))
  const jsx = lines.filter((line) => !line.startsWith('import ')).join('\n').trim()
  return `${imports.join('\n')}\nexport const sample = (\n<>\n${jsx}\n</>\n)\n`
}

const verdict = compile({
  sample: wrap(asModule(SAMPLES[0] ?? '')),
  named: wrap(`import { ${PARTS} } from 'topclassui/avatar'\nexport const named = (\n${SAMPLES[2] ?? ''})\n`),
  imageNoAlt: wrap(`import { ${PARTS} } from 'topclassui/avatar'\nexport const bad = <AvatarImage src="/a.jpg" />\n`),
  imageHandler: wrap(`import { ${PARTS} } from 'topclassui/avatar'\nexport const ok = <AvatarImage src="/a.jpg" alt="A" onError={(event) => { void event.currentTarget.src }} />\n`),
})

describe('the samples in the README compile as written', () => {
  it('finds the three samples; the next/image one is not compiled, since next is not a dependency', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain(`import { ${PARTS} } from 'topclassui/avatar'`)
    expect(SAMPLES[1]).toContain("import Image from 'next/image'")
    expect(SAMPLES[2]).toContain('<AvatarRoot aria-label="Lina Haddad">')
  })

  it('the import block and the sample under it', () => {
    expect(verdict['sample']).toEqual([])
  })

  it('initials named on the root', () => {
    expect(verdict['named']).toEqual([])
  })
})

describe('what AvatarImage takes', () => {
  it('refuses an img with no alt', () => {
    expect((verdict['imageNoAlt'] ?? []).join(' ')).toContain("is not assignable to type 'IntrinsicAttributes & AvatarImageProps'")
  })

  it("takes the caller's onError, typed as an img event, which the client part still calls", () => {
    expect(verdict['imageHandler']).toEqual([])
  })
})
