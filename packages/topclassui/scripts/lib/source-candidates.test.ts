import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { findDemos } from './harness.js'
import {
  SOURCE_FOLDERS, candidatesInSource, clientPackages, isShipped, sourceCandidates, sourceFiles,
} from './source-candidates.js'

const made: string[] = []
afterAll(() => { for (const dir of made) rmSync(dir, { recursive: true, force: true }) })

function checkout(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'tc-candidates-'))
  made.push(root)
  for (const [file, source] of Object.entries(files)) {
    const path = join(root, ...file.split('/'))
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, source)
  }
  return root
}

describe('reading class candidates out of source text', () => {
  it('takes every token of a string in single quotes, double quotes and backticks', () => {
    expect(candidatesInSource(`const a = 'flex gap-2'`)).toEqual(['flex', 'gap-2'])
    expect(candidatesInSource(`<div className="grid p-4" />`)).toEqual(['grid', 'p-4'])
    expect(candidatesInSource('const a = `sticky top-0`')).toEqual(['sticky', 'top-0'])
  })

  it('finds a class no markup holds yet, which is the whole reason to read the source', () => {
    const source = [
      'export const TOOLTIP_ARROW = [',
      "  'size-2 rotate-45 bg-neutral-solid',",
      "  'data-[side=top]:-bottom-1',",
      "  'data-[side=inline-start]:-inset-e-1',",
      "].join(' ')",
    ].join('\n')
    expect(candidatesInSource(source)).toEqual(expect.arrayContaining([
      'size-2', 'rotate-45', 'bg-neutral-solid', 'data-[side=top]:-bottom-1', 'data-[side=inline-start]:-inset-e-1',
    ]))
  })

  it('reads the fixed tokens of a template around its expressions', () => {
    const found = candidatesInSource('export const BORDER = `${BORDER_WIDTH} border-line shadow-lg`')
    expect(found).toEqual(expect.arrayContaining(['border-line', 'shadow-lg']))
  })

  it('reads a template that runs over several lines', () => {
    expect(candidatesInSource('const a = `flex\n  items-center\n  gap-2`')).toEqual(['flex', 'items-center', 'gap-2'])
  })

  it('reads a JSX attribute that runs over two lines, which a line-by-line reader would drop', () => {
    expect(candidatesInSource('<div className="flex\n  gap-2" />')).toEqual(['flex', 'gap-2'])
  })

  it('reads the string inside a template expression, and what follows it', () => {
    const found = candidatesInSource("const a = `flex ${on ? 'bg-primary-solid text-primary-on-solid' : ''} rounded-box`")
    expect(found).toEqual(expect.arrayContaining(['flex', 'bg-primary-solid', 'text-primary-on-solid', 'rounded-box']))
  })

  it('keeps a class whole when it holds the other kind of quote', () => {
    expect(candidatesInSource(`const a = "before:content-['*'] before:block"`)).toEqual(expect.arrayContaining([
      "before:content-['*']", 'before:block',
    ]))
  })

  it('reads past an escaped quote instead of ending the string there', () => {
    const found = candidatesInSource(String.raw`const a = 'before:content-[\'*\'] before:block'`)
    expect(found).toEqual(expect.arrayContaining(["before:content-['*']", 'before:block']))
  })

  it('is not thrown off by an apostrophe in a comment before the string', () => {
    const source = "// it isn't a class\nconst a = 'max-w-xs wrap-anywhere'\n// and this one doesn't end\n"
    expect(candidatesInSource(source)).toEqual(expect.arrayContaining(['max-w-xs', 'wrap-anywhere']))
  })

  it('lists a token once however often it is written, and nothing for a file with no string', () => {
    expect(candidatesInSource(`const a = 'flex flex'; const b = "flex"`).filter((token) => token === 'flex')).toEqual(['flex'])
    expect(candidatesInSource('export const a = 1\n')).toEqual([])
  })
})

describe('which files are read', () => {
  it('reads a component, its parts and its demos, and never a test', () => {
    expect(isShipped('src/components/tooltip/classes.ts')).toBe(true)
    expect(isShipped('src/components/avatar/parts/avatar-root.tsx')).toBe(true)
    expect(isShipped('src/components/tooltip/dummy/basic.tsx')).toBe(true)
    expect(isShipped('src/components/tooltip/test/tooltip.css.test.ts')).toBe(false)
    expect(isShipped('src/components/tooltip/test/helpers.ts')).toBe(false)
    expect(isShipped('src/shared/classes.test.ts')).toBe(false)
    expect(isShipped('src/shared/render.dom.test.tsx')).toBe(false)
  })

  it('judges a Windows path the same way', () => {
    expect(isShipped(String.raw`src\components\tooltip\test\helpers.ts`)).toBe(false)
    expect(isShipped(String.raw`src\components\tooltip\classes.ts`)).toBe(true)
  })

  it('does not take a file for a test because a word in its name starts with test', () => {
    expect(isShipped('src/shared/testimonial.ts')).toBe(true)
    expect(isShipped('src/components/latest/index.tsx')).toBe(true)
  })

  const root = checkout({
    'src/components/tooltip/classes.ts': "export const A = 'max-w-xs wrap-anywhere'\n",
    'src/components/tooltip/dummy/basic.tsx': 'export default () => <div className="p-12" />\n',
    'src/components/tooltip/test/tooltip.test.ts': "expect(lint('bg-red-500')).toBe(false)\n",
    'src/components/tooltip/README.md': 'Use `text-9xl` here.\n',
    'src/shared/classes.ts': "export const SCRIM = 'fixed inset-0 bg-overlay'\n",
    'src/shared/classes.test.ts': "expect(SCRIM).not.toContain('bg-blue-500')\n",
    'src/icons/data/x.ts': "export const x = 'M0,0 not-a-class-of-ours'\n",
    'scripts/check.ts': "const banned = 'left-0'\n",
  })

  it('walks src/components and src/shared, and nothing else', () => {
    expect(SOURCE_FOLDERS).toEqual(['src/components', 'src/shared'])
    expect(sourceFiles(root).sort()).toEqual([
      join(root, 'src', 'components', 'tooltip', 'classes.ts'),
      join(root, 'src', 'components', 'tooltip', 'dummy', 'basic.tsx'),
      join(root, 'src', 'shared', 'classes.ts'),
    ])
  })

  it('collects the candidates of those files, without what only a test, an icon or a script names', () => {
    expect(sourceCandidates(root).sort()).toEqual([
      'bg-overlay', 'fixed', 'inset-0', 'max-w-xs', 'p-12', 'wrap-anywhere',
    ])
  })

  it('is not fooled by a checkout that itself lives in a folder named test', () => {
    const inside = checkout({ 'test/src/shared/classes.ts': "export const A = 'isolate'\n" })
    expect(sourceCandidates(join(inside, 'test'))).toEqual(['isolate'])
  })
})

describe('the real source', () => {
  const found = new Set(sourceCandidates(process.cwd()))

  it('yields every class of the tooltip popup, its positioner and its arrow, none of which a closed tooltip renders', () => {
    const missing = [
      'max-w-xs', 'wrap-anywhere', 'rounded-control', 'bg-neutral-solid', 'px-3', 'py-1', 'text-xs',
      'text-neutral-on-solid', 'z-(--tc-z-popup)', 'data-anchor-hidden:invisible', 'size-2', 'rotate-45',
      'data-[side=top]:-bottom-1', 'data-[side=bottom]:-top-1',
      'data-[side=inline-start]:-inset-e-1', 'data-[side=inline-end]:-inset-s-1',
    ].filter((name) => !found.has(name))
    expect(missing).toEqual([])
  })

  it('yields the classes a shared constant builds from another, and the ones a demo lays itself out with', () => {
    expect(found.has('border-line')).toBe(true)
    expect(found.has('focus-visible:outline-(length:--tc-ring-width)')).toBe(true)
    expect(found.has('grid-cols-3')).toBe(true)
  })
})

describe('the packages the browser will ask for', () => {
  const root = process.cwd()
  const client = join(root, 'scripts', 'lib', 'live-client.tsx')

  it('follows the imports from the hydration entry and a demo down to the packages', () => {
    const found = clientPackages(root, [client, join(root, 'src', 'components', 'tooltip', 'dummy', 'basic.tsx')])
    expect(found).toEqual(expect.arrayContaining([
      '@base-ui/react/direction-provider', '@base-ui/react/tooltip', 'clsx', 'react', 'react-dom/client', 'tailwind-merge',
    ]))
  })

  it('adds the two JSX runtimes, which the compiler imports and no source file names', () => {
    expect(clientPackages(root, [])).toEqual(['react/jsx-dev-runtime', 'react/jsx-runtime'])
  })

  it('keeps what only the server and the tools load out of the browser bundle', () => {
    const found = clientPackages(root, [client, ...findDemos(root).map((demo) => demo.file)])
    expect(found.filter((name) => /^(node:|react-dom\/server|tailwindcss|vitest|zod$|server-only)/.test(name))).toEqual([])
  })

  it('drops a quoted word after "import" in prose, which the scanner takes for a specifier, unless it is installed', () => {
    const fixture = checkout({
      'package.json': '{ "imports": { "#components/*": "./src/components/*" } }',
      'node_modules/react/package.json': '{}',
      'node_modules/@base-ui/react/package.json': '{}',
      'src/components/note/index.tsx': "import { Tooltip } from '@base-ui/react/tooltip'\nexport const Note = Tooltip\n",
      'src/components/note/dummy/basic.tsx': [
        "import { useId } from 'react'",
        "import { Note } from '#components/note/index.js'",
        'export default () => <p id={useId()}>The import of "contacts" finished: <Note /></p>',
      ].join('\n'),
    })
    expect(clientPackages(fixture, [join(fixture, 'src', 'components', 'note', 'dummy', 'basic.tsx')])).toEqual([
      '@base-ui/react/tooltip', 'react', 'react/jsx-dev-runtime', 'react/jsx-runtime',
    ])
  })

  it('lists package names only, sorted, though a demo may write the word import in its prose', () => {
    const found = clientPackages(root, findDemos(root).map((demo) => demo.file))
    expect(found.filter((name) => !/^(@[\w.-]+\/)?[\w.-]+(\/[\w./-]+)?$/.test(name))).toEqual([])
    expect(found).toEqual([...found].sort())
  })
})
