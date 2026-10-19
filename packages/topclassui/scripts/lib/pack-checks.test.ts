import { describe, expect, it } from 'vitest'

import {
  SIZE_BUDGET_BYTES, manifestProblems, pathProblems, sizeProblems, specifierProblems, specifiersOf, targetsOf,
} from './pack-checks.js'

const CLEAN = ['package.json', 'README.md', 'LICENSE', 'dist/styles.css', 'dist/tokens.css', 'dist/components/button/index.js']

describe('pathProblems', () => {
  it('accepts dist and the five root files', () => {
    expect(pathProblems([...CLEAN, 'CHANGELOG.md', 'size.json'])).toEqual([])
  })

  it('names a path outside dist', () => {
    expect(pathProblems([...CLEAN, 'src/index.ts'])).toEqual(['src/index.ts: outside dist/'])
  })

  it('names a demo, a test folder, a test file and a source map', () => {
    expect(pathProblems([...CLEAN, 'dist/components/button/dummy/basic.js'])).toEqual(['dist/components/button/dummy/basic.js: a demo is packed'])
    expect(pathProblems([...CLEAN, 'dist/components/button/test/x.js'])).toEqual(['dist/components/button/test/x.js: a test folder is packed'])
    expect(pathProblems([...CLEAN, 'dist/shared/cn.test.js'])).toEqual(['dist/shared/cn.test.js: a test file is packed'])
    expect(pathProblems([...CLEAN, 'dist/shared/cn.js.map'])).toEqual(['dist/shared/cn.js.map: a source map is packed'])
  })

  it('requires both CSS files', () => {
    expect(pathProblems(['package.json', 'dist/tokens.css'])).toEqual(['dist/styles.css: missing from the tarball'])
  })
})

describe('specifiersOf', () => {
  it('reads an import, a re-export, a side-effect import, a dynamic import and a declaration reference', () => {
    const source = [
      "import { cn } from '../../shared/cn.js'",
      "export * from './client.js'",
      "import 'server-only'",
      "const x = import('./lib.js')",
      'type T = import("../../icons/types.js").IconData',
    ].join('\n')
    expect(specifiersOf(source)).toEqual(['../../shared/cn.js', './client.js', 'server-only', './lib.js', '../../icons/types.js'])
  })
})

describe('specifierProblems', () => {
  it('accepts relative specifiers with .js and bare package names', () => {
    expect(specifierProblems('dist/a.js', "import { a } from './b.js'\nimport { c } from 'clsx'\nimport React from 'react'")).toEqual([])
  })

  it('names a # specifier the build left behind', () => {
    expect(specifierProblems('dist/components/dialog/client.js', "import { cn } from '#shared/cn.js'"))
      .toEqual(['dist/components/dialog/client.js: imports #shared/cn.js, a # specifier the build did not rewrite'])
  })

  it('names a relative specifier without .js', () => {
    expect(specifierProblems('dist/components/toast/constants.d.ts', 'type T = import("../../icons").IconData'))
      .toEqual(['dist/components/toast/constants.d.ts: imports ../../icons, a relative specifier without .js'])
  })
})

describe('targetsOf', () => {
  it('reads a string, a condition object and an array', () => {
    expect(targetsOf('./dist/styles.css')).toEqual(['./dist/styles.css'])
    expect(targetsOf({ types: './dist/a.d.ts', default: './dist/a.js' })).toEqual(['./dist/a.d.ts', './dist/a.js'])
    expect(targetsOf([{ default: './dist/a.js' }, './dist/b.js'])).toEqual(['./dist/a.js', './dist/b.js'])
  })
})

describe('manifestProblems', () => {
  const paths = ['package.json', 'dist/shared/cn.js', 'dist/shared/cn.d.ts', 'dist/components/button/index.js', 'dist/components/button/index.d.ts']

  it('accepts imports into dist and exports whose every target, pattern included, is packed', () => {
    const manifest = {
      imports: { '#shared/*': './dist/shared/*' },
      exports: {
        './package.json': './package.json',
        './cn': { types: './dist/shared/cn.d.ts', default: './dist/shared/cn.js' },
        './*': { types: './dist/components/*/index.d.ts', default: './dist/components/*/index.js' },
      },
    }
    expect(manifestProblems(manifest, paths)).toEqual([])
  })

  it('names an imports target that still points at src', () => {
    expect(manifestProblems({ imports: { '#test/*': './src/test/*' } }, paths)).toEqual(['imports #test/*: ./src/test/* is outside dist/'])
  })

  it('names an exports target no packed file matches, exact or pattern', () => {
    expect(manifestProblems({ exports: { './theme': { default: './dist/shared/theme/theme-script.js' } } }, paths))
      .toEqual(['exports ./theme: ./dist/shared/theme/theme-script.js is not in the tarball'])
    expect(manifestProblems({ exports: { './icons/*': './dist/icons/data/*.js' } }, paths))
      .toEqual(['exports ./icons/*: ./dist/icons/data/*.js is not in the tarball'])
  })
})

describe('sizeProblems', () => {
  it('pins the budget to the first measured tarball plus 10 %', () => {
    expect(SIZE_BUDGET_BYTES).toBe(3_050_000)
  })

  it('passes at the budget and fails one byte over', () => {
    expect(sizeProblems(3_050_000)).toEqual([])
    expect(sizeProblems(3_050_001)).toEqual(['unpacked size 3050001 bytes is over the 3050000 byte budget'])
  })
})
