import { describe, expect, it } from 'vitest'

import { blankComments, packageName, rewriteSpecifier, rewriteSpecifiers, specifiersOf } from '../src/lib/specifiers.js'
import { rewriteFile } from '../src/lib/rewrite.js'

describe('specifiersOf', () => {
  it('reads static, multi-line, type-only, side-effect and dynamic imports and re-exports', () => {
    const code = [
      "import { a } from '#shared/a.js'",
      'import type {',
      '  B,',
      "} from './b.js'",
      "import 'server-only'",
      "export { c } from '../c.js'",
      "export * from '#icons/index.js'",
      "type L = typeof import('./lazy.js')",
      "const load = () => import('./data/x.js')",
    ].join('\n')
    expect(specifiersOf(code)).toEqual(['#shared/a.js', './b.js', '../c.js', '#icons/index.js', 'server-only', './lazy.js', './data/x.js'])
  })

  it('ignores comments, sample text and exported constants that are not imports', () => {
    const code = [
      "// import { x } from 'commented'",
      '/* import { y } from "blocked" */',
      "const CODE = `import { CodeBlock } from 'topclassui'`",
      "export const MISSING = 'not-a-module'",
      "const url = 'https://example.com/x'",
    ].join('\n')
    expect(specifiersOf(code)).toEqual([])
  })

  it('keeps a URL inside a string when blanking comments', () => {
    expect(blankComments("const a = 'https://x.dev' // note")).toBe("const a = 'https://x.dev'        ")
  })

  it('names the package of a subpath import', () => {
    expect(packageName('@base-ui/react/dialog')).toBe('@base-ui/react')
    expect(packageName('zod/mini')).toBe('zod')
    expect(packageName('react')).toBe('react')
  })
})

describe('rewriteSpecifier', () => {
  const bundler = { stripJs: true }
  const node16 = { stripJs: false }

  it('turns an alias into a relative path at depth one, two and three', () => {
    expect(rewriteSpecifier('styles.ts', '#shared/cn.js', node16)).toBe('./shared/cn.js')
    expect(rewriteSpecifier('shared/cn.ts', '#shared/classes.js', node16)).toBe('./classes.js')
    expect(rewriteSpecifier('components/dialog/client.tsx', '#shared/cn.js', node16)).toBe('../../shared/cn.js')
    expect(rewriteSpecifier('components/navbar/parts/navbar-link.tsx', '#icons/data/x.js', node16)).toBe('../../../icons/data/x.js')
    expect(rewriteSpecifier('components/button/index.tsx', '#components/svg/index.js', node16)).toBe('../svg/index.js')
  })

  it('drops .js under bundler resolution and keeps it under node16', () => {
    expect(rewriteSpecifier('components/dialog/client.tsx', '#shared/cn.js', bundler)).toBe('../../shared/cn')
    expect(rewriteSpecifier('components/dialog/client.tsx', './hook.js', bundler)).toBe('./hook')
    expect(rewriteSpecifier('components/dialog/client.tsx', './hook.js', node16)).toBe('./hook.js')
  })

  it('normalises a Windows path before computing the relative one', () => {
    expect(rewriteSpecifier('components\\dialog\\client.tsx', '#shared/cn.js', bundler)).toBe('../../shared/cn')
  })

  it('reports a #test/ specifier instead of rewriting it', () => {
    const out = rewriteSpecifiers('components/x/index.tsx', "import { t } from '#test/render.js'\n", bundler)
    expect(out.leftover).toEqual(['#test/render.js'])
    expect(out.code).toBe("import { t } from '#test/render.js'\n")
  })

  it('leaves bare packages and non-import strings alone', () => {
    const code = "import { z } from 'zod'\nconst c = '#fff'\nimport { a } from '#shared/a.js'\n"
    expect(rewriteSpecifiers('components/x/index.tsx', code, bundler).code).toBe(
      "import { z } from 'zod'\nconst c = '#fff'\nimport { a } from '../../shared/a'\n",
    )
  })
})

describe('rewriteFile', () => {
  const vite = { framework: 'vite-react', moduleResolution: 'bundler', importBase: './src/topclassui' } as const
  const next = { framework: 'next-app', moduleResolution: 'bundler', importBase: '@/topclassui' } as const

  it("strips 'use client' from every Vite file, the second of two consecutive ones included", () => {
    const a = "'use client'\n\nimport { x } from './x.js'\n"
    const b = '"use client";\nexport const y = 1\n'
    expect([a, b].map((code, i) => rewriteFile(`components/c/f${String(i)}.tsx`, code, vite))).toEqual([
      "import { x } from './x'\n",
      'export const y = 1\n',
    ])
  })

  it("keeps 'use client' in a Next.js project", () => {
    expect(rewriteFile('components/c/client.tsx', "'use client'\n\nimport { x } from './x.js'\n", next)).toBe(
      "'use client'\n\nimport { x } from './x'\n",
    )
  })

  it('points the icon-registry warning at the copied icon data', () => {
    const code = "      + `  import { ${local} } from 'topclassui/icons/${name}'\\n`\n"
    expect(rewriteFile('components/icon-registry/index.tsx', code, next)).toBe(
      "      + `  import { ${local} } from '@/topclassui/icons/data/${name}'\\n`\n",
    )
  })

  it('copies CSS byte for byte', () => {
    expect(rewriteFile('styles.css', '@source "./components";\n', vite)).toBe('@source "./components";\n')
  })
})
