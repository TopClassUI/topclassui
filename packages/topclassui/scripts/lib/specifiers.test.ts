import { describe, expect, it } from 'vitest'

import {
  ALIASES,
  USE_CLIENT,
  isCompiledSource,
  isWatchSummary,
  outputFor,
  rewriteSource,
  rewriteSpecifier,
  startsWithUseClient,
  watchErrors,
} from './specifiers.js'

describe('rewriteSpecifier', () => {
  it('covers the three aliases package.json maps into src and nothing else', () => {
    expect(Object.keys(ALIASES)).toEqual(['#shared/', '#icons/', '#components/'])
  })

  it('climbs two folders from a component file to shared', () => {
    expect(rewriteSpecifier('dist/components/dialog/client.js', '#shared/cn.js')).toBe('../../shared/cn.js')
  })

  it('climbs three folders from a part file', () => {
    expect(rewriteSpecifier('dist/components/dialog/parts/dialog-body.js', '#shared/classes.js')).toBe(
      '../../../shared/classes.js',
    )
  })

  it('stays inside the folder when the target is a sibling tree', () => {
    expect(rewriteSpecifier('dist/icons/index.d.ts', '#icons/data/x.js')).toBe('./data/x.js')
  })

  it('reaches a sibling component through its own folder', () => {
    expect(rewriteSpecifier('dist/components/toast/constants.js', '#components/icon/index.js')).toBe(
      '../icon/index.js',
    )
  })

  it('starts a same-folder target with ./, which a bare name would not be', () => {
    expect(rewriteSpecifier('dist/shared/provider/provider.js', '#shared/provider/context.js')).toBe('./context.js')
  })

  it('writes forward slashes for a Windows path', () => {
    expect(rewriteSpecifier('dist\\components\\dialog\\client.js', '#shared/cn.js')).toBe('../../shared/cn.js')
  })

  it('returns null for an alias the build does not know', () => {
    expect(rewriteSpecifier('dist/components/dialog/client.js', '#test/markup.js')).toBe(null)
  })
})

describe('rewriteSource', () => {
  it('rewrites an import, a type import and a re-export in one file', () => {
    const code = [
      "import { cn } from '#shared/cn.js';",
      "import type { Size } from '#shared/contracts/size.js';",
      "export * from '#components/button/index.js';",
    ].join('\n')
    expect(rewriteSource('dist/components/dialog/client.js', code)).toEqual({
      code: [
        "import { cn } from '../../shared/cn.js';",
        "import type { Size } from '../../shared/contracts/size.js';",
        "export * from '../button/index.js';",
      ].join('\n'),
      rewritten: 3,
      leftover: [],
    })
  })

  it('rewrites the import("...").Type reference tsc writes into a declaration', () => {
    const code = 'export declare const ICONS: Record<string, import("#icons/types.js").IconData>;'
    expect(rewriteSource('dist/components/toast/constants.d.ts', code)).toEqual({
      code: 'export declare const ICONS: Record<string, import("../../icons/types.js").IconData>;',
      rewritten: 1,
      leftover: [],
    })
  })

  it('rewrites a dynamic import with spaces around the parenthesis', () => {
    expect(rewriteSource('dist/components/icon/index.js', "const m = await import( '#icons/data/check.js' );")).toEqual(
      { code: "const m = await import( '../../icons/data/check.js' );", rewritten: 1, leftover: [] },
    )
  })

  it('leaves a bare package and a relative specifier alone', () => {
    const code = "import 'server-only';\nimport { x } from './lib.js';\nimport { jsx } from \"react/jsx-runtime\";"
    expect(rewriteSource('dist/components/icon/index.js', code)).toEqual({ code, rewritten: 0, leftover: [] })
  })

  it('leaves a # inside an ordinary string alone', () => {
    const code = "const color = '#fff';\nconst id = \"#main\";"
    expect(rewriteSource('dist/shared/x.js', code)).toEqual({ code, rewritten: 0, leftover: [] })
  })

  it('reports a #test specifier instead of rewriting it', () => {
    const code = "import { markup } from '#test/markup.js';"
    expect(rewriteSource('dist/components/button/index.js', code)).toEqual({
      code,
      rewritten: 0,
      leftover: ['#test/markup.js'],
    })
  })
})

describe('isCompiledSource', () => {
  it('takes a component file, a dummy demo and a shared file', () => {
    expect(isCompiledSource('src/components/dialog/client.tsx')).toBe(true)
    expect(isCompiledSource('src/components/dialog/dummy/basic.tsx')).toBe(true)
    expect(isCompiledSource('src\\shared\\cn.ts')).toBe(true)
  })

  it('leaves out a test, a test folder, the shared test helpers and a stylesheet', () => {
    expect(isCompiledSource('src/components/dialog/test/dialog.dom.test.tsx')).toBe(false)
    expect(isCompiledSource('src/sources.test.ts')).toBe(false)
    expect(isCompiledSource('src/test/stylesheet.ts')).toBe(false)
    expect(isCompiledSource('src/tokens.css')).toBe(false)
  })
})

describe('outputFor', () => {
  it('maps a .tsx source to its .js under dist', () => {
    expect(outputFor('src/components/dialog/client.tsx')).toBe('dist/components/dialog/client.js')
  })

  it('maps a .ts source and a Windows path the same way', () => {
    expect(outputFor('src\\shared\\provider\\provider.ts')).toBe('dist/shared/provider/provider.js')
  })
})

describe('startsWithUseClient', () => {
  it('accepts the directive in either quote style, with or without a semicolon', () => {
    expect(USE_CLIENT).toBe("'use client'")
    expect(startsWithUseClient("'use client'\nimport x")).toBe(true)
    expect(startsWithUseClient('"use client";\nimport x')).toBe(true)
  })

  it('rejects a file whose directive moved below an import, where React ignores it', () => {
    expect(startsWithUseClient("import x from 'y';\n'use client';")).toBe(false)
  })

  it('rejects a comment before the directive', () => {
    expect(startsWithUseClient("// client\n'use client'")).toBe(false)
  })
})

describe('watch summary lines', () => {
  it('recognises both the singular and the plural tsc prints', () => {
    expect(isWatchSummary('[9:00:00 AM] Found 0 errors. Watching for file changes.')).toBe(true)
    expect(isWatchSummary('[9:00:00 AM] Found 1 error. Watching for file changes.')).toBe(true)
    expect(isWatchSummary('[9:00:00 AM] Starting compilation in watch mode...')).toBe(false)
  })

  it('reads the error count', () => {
    expect(watchErrors('[9:00:00 AM] Found 0 errors. Watching for file changes.')).toBe(0)
    expect(watchErrors('[9:00:00 AM] Found 12 errors. Watching for file changes.')).toBe(12)
    expect(watchErrors('something else')).toBe(0)
  })
})
