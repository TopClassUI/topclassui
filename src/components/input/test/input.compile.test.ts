import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'input')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `input-probe-${name}.tsx`))
const INDEX = slash(join(FOLDER, 'index.tsx'))

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `import { Input } from '../index.js'\n${code}\n`]))

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
  const errorsOf = (file: string) => ts.getPreEmitDiagnostics(program, program.getSourceFile(file))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  const out: Record<string, string[]> = { index: errorsOf(INDEX) }
  for (const name of Object.keys(snippets)) out[name] = errorsOf(probePath(name))
  return out
}

/** The second import a wrapper needs, which a probe that never names the type must not carry. */
const PROPS = "import type { InputProps } from '../index.js'\n"

/** The skeleton, which comes from the same entry as the control it stands in for. */
const SKELETON = "import { InputSkeleton } from '../index.js'\n"

const verdict = compile({
  unnamed: "export const bad = <Input type='email' />",
  withId: "export const ok = <Input id='email' />",
  labelled: "export const ok = <Input aria-label='Email' />",
  labelledby: "export const ok = <Input aria-labelledby='email-label' />",
  all: "export const ok = <Input id='email' aria-label='Email' aria-labelledby='email-label' />",
  child: "export const bad = <Input aria-label='Email'>Hello</Input>",
  nativeSize: "export const bad = <Input aria-label='Email' size={20} />",
  uncapped: "export const ok = <Input aria-label='Email' maxLength={null} />",
  variant: "export const bad = <Input aria-label='Email' variant='outline' />",
  sample: "export const ok = <Input id='email' name='email' type='email' autoComplete='email' required invalid fullWidth />",
  token: "export const ok = <Input aria-label='Email' style={{ '--tc-input-width': '20rem' }} />",
  wrapper: `${PROPS}export const Search = (props: InputProps) => <Input {...props} type='search' />`,
  omitted: `${PROPS}export const Search = (props: Omit<InputProps, 'type'>) => <Input {...props} type='search' />`,
  skeletonPair: `${SKELETON}export const ok = [<Input key='a' id='q' size='lg' fullWidth />, <InputSkeleton key='b' size='lg' fullWidth />]`,
  skeletonState: `${SKELETON}export const bad = [<Input key='a' id='q' invalid />, <InputSkeleton key='b' invalid />]`,
})

describe('a name is required by the type (R-5.6-1)', () => {
  it('refuses an Input with no id, no aria-label and no aria-labelledby', () => {
    // The message, not a count: a program that fails for any other reason also has errors.
    expect((verdict['unnamed'] ?? []).join(' ')).toContain("Property ''aria-labelledby'' is missing")
  })

  it('accepts an id alone, which is what a label points at', () => {
    expect(verdict['withId']).toEqual([])
  })

  it('accepts aria-label alone', () => {
    expect(verdict['labelled']).toEqual([])
  })

  it('accepts aria-labelledby alone', () => {
    expect(verdict['labelledby']).toEqual([])
  })

  it('accepts all three together', () => {
    expect(verdict['all']).toEqual([])
  })
})

describe('what an Input does not take', () => {
  it('refuses children, because an input is a void element', () => {
    expect((verdict['child'] ?? []).join(' ')).toContain("Property 'children' does not exist")
  })

  it('refuses the native character width, since size is the design scale', () => {
    expect((verdict['nativeSize'] ?? []).join(' ')).toContain("Type 'number' is not assignable")
  })

  it('refuses the variant prop, which is not built', () => {
    expect((verdict['variant'] ?? []).join(' ')).toContain("Property 'variant' does not exist")
  })
})

describe('what an Input does take', () => {
  it('compiles on its own, as in a consumer program', () => {
    expect(verdict['index']).toEqual([])
  })

  it('takes maxLength={null}, which removes the cap', () => {
    expect(verdict['uncapped']).toEqual([])
  })

  it('takes the docs sample: native props beside the design props', () => {
    expect(verdict['sample']).toEqual([])
  })
})

describe('the --tc-* style keys reach a program that compiles only Input', () => {
  it('compiles the width the README names, set through style', () => {
    expect(verdict['token']).toEqual([])
  })
})

describe('the skeleton takes the two props that decide the box of the field', () => {
  it('compiles with the same size and fullWidth as the Input beside it', () => {
    expect(verdict['skeletonPair']).toEqual([])
  })

  it('refuses invalid, which changes no box', () => {
    expect((verdict['skeletonState'] ?? []).join(' ')).toContain("Property 'invalid' does not exist")
  })
})

describe('wrapping an Input, as the README says to', () => {
  it('compiles when the wrapper takes InputProps and sets the type inside', () => {
    expect(verdict['wrapper']).toEqual([])
  })

  it('refuses Omit<InputProps>, which makes all three names optional, so none is required', () => {
    expect((verdict['omitted'] ?? []).join(' ')).toContain("Types of property ''aria-labelledby'' are incompatible")
  })
})
