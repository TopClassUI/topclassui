import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { demoKindOf, reachesClient, sourceOf } from './demo-kind.js'
import { COMPONENTS } from './library.js'

function libraryOf(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'demo-kind-'))
  for (const [path, source] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), source)
  }
  return root
}

const root = libraryOf({
  'src/components/menu/client.tsx': "'use client'\n\nexport function MenuPopup() { return null }\n",
  'src/components/menu/index.tsx': "export { MenuPopup } from './client.js'\n",
  'src/components/badge/index.tsx': "import { cn } from '#shared/cn.js'\nexport function Badge() { return cn() }\n",
  'src/shared/cn.ts': 'export const cn = () => 1\n',
  'src/components/menu/dummy/plain.tsx': "import { Badge } from '#components/badge/index.js'\nexport default function Demo() { return Badge() }\n",
  'src/components/menu/dummy/popup.tsx': "import { MenuPopup } from '../index.js'\nexport default function Demo() { return MenuPopup() }\n",
  'src/components/menu/dummy/action.tsx': "import { MenuPopup } from '../index.js'\nasync function go() {\n  'use server'\n}\nexport default function Demo() { return [MenuPopup(), go] }\n",
  'src/components/menu/dummy/action-alone.tsx': "async function go() {\n  'use server'\n}\nexport default function Demo() { return go }\n",
})

describe('sourceOf', () => {
  it('resolves an alias and a relative .js specifier to the .tsx or .ts beside it, and nothing outside the library', () => {
    expect(sourceOf('#shared/cn.js', join(root, 'src/components/badge/index.tsx'), root)).toBe(join(root, 'src/shared/cn.ts'))
    expect(sourceOf('../index.js', join(root, 'src/components/menu/dummy/popup.tsx'), root)).toBe(join(root, 'src/components/menu/index.tsx'))
    expect(sourceOf('react', join(root, 'src/components/menu/dummy/popup.tsx'), root)).toBe(null)
  })
})

describe('reachesClient', () => {
  it('follows re-exports to a client file and stops at the edge of the library', () => {
    expect(reachesClient(join(root, 'src/components/menu/dummy/popup.tsx'), root)).toBe(true)
    expect(reachesClient(join(root, 'src/components/menu/dummy/plain.tsx'), root)).toBe(false)
  })
})

describe('demoKindOf', () => {
  it('names a server demo, a client demo, and a client demo with an inline Server Action', () => {
    expect(demoKindOf(join(root, 'src/components/menu/dummy/plain.tsx'), root)).toBe('server')
    expect(demoKindOf(join(root, 'src/components/menu/dummy/popup.tsx'), root)).toBe('client')
    expect(demoKindOf(join(root, 'src/components/menu/dummy/action.tsx'), root)).toBe('action')
    expect(demoKindOf(join(root, 'src/components/menu/dummy/action-alone.tsx'), root)).toBe('server')
  })

  it('reads the library as it is: Badge stays server, Dialog hydrates, the data-driven Dropdown keeps its action', () => {
    expect(demoKindOf(join(COMPONENTS, 'badge', 'dummy', 'tones.tsx'))).toBe('server')
    expect(demoKindOf(join(COMPONENTS, 'dialog', 'dummy', 'basic.tsx'))).toBe('client')
    expect(demoKindOf(join(COMPONENTS, 'dropdown', 'dummy', 'data-driven.tsx'))).toBe('action')
  })
})
