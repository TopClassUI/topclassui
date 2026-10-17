import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const SCRIPT = join(process.cwd(), 'scripts', 'check-boundaries.ts')
const TSX = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs')

let dir = ''
afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }) })

/** Runs the real script over a src/ holding only these files. */
function run(files: Record<string, string>) {
  dir = mkdtempSync(join(tmpdir(), 'tc-boundaries-'))
  for (const [path, source] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), source)
  }
  return spawnSync('node', [TSX, SCRIPT], { cwd: dir, encoding: 'utf8' })
}

const SERVER_LINK = [
  "import { renderElement } from '#shared/render.js'",
  'export function Link({ render, ...rest }: LinkProps) {',
  '  return renderElement(render ?? <a />, rest)',
  '}',
].join('\n')

describe('check-boundaries enforces R-5.7-4', () => {
  it('passes a server part that takes render through renderElement', () => {
    const result = run({ 'src/components/x/parts/x-link.tsx': SERVER_LINK })
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('rejects useRender in index.tsx', () => {
    const result = run({
      'src/components/x/index.tsx': "import { useRender } from '@base-ui/react/use-render'\nexport { useRender }\n",
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/index.tsx: useRender calls hooks')
  })

  it('rejects useRender in a server part, which index.tsx rules do not reach', () => {
    const result = run({
      'src/components/x/parts/x-link.tsx': SERVER_LINK.replace(
        "import { renderElement } from '#shared/render.js'",
        "import { renderElement } from '#shared/render.js'\nimport { useRender } from '@base-ui/react'",
      ),
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/parts/x-link.tsx: useRender calls hooks')
  })

  it('rejects a server file that takes render and clones it by hand', () => {
    const result = run({
      'src/components/x/parts/x-link.tsx': [
        "import { cloneElement } from 'react'",
        'export function Link({ render, ...rest }: LinkProps) {',
        '  return cloneElement(render ?? <a />, rest)',
        '}',
      ].join('\n'),
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/parts/x-link.tsx: takes a render prop without calling renderElement')
  })

  it('lets a client file use useRender', () => {
    const result = run({
      'src/components/x/client.tsx': [
        "'use client'",
        "import { useRender } from '@base-ui/react/use-render'",
        'export function XTrigger({ render, ...rest }: XTriggerProps) {',
        "  return useRender({ render, defaultTagName: 'button', props: rest })",
        '}',
      ].join('\n'),
    })
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('rejects a server file that imports renderElement and still clones render by hand', () => {
    const result = run({
      'src/components/x/parts/x-link.tsx': SERVER_LINK.replace('renderElement(render ?? <a />, rest)', 'cloneElement(render ?? <a />, rest)'),
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/parts/x-link.tsx: takes a render prop without calling renderElement')
  })

  it('rejects a server file that handles the function form of render', () => {
    const result = run({
      'src/components/x/parts/x-link.tsx': SERVER_LINK.replace(
        'return renderElement(render ?? <a />, rest)',
        "return typeof render === 'function' ? render(rest) : renderElement(render ?? <a />, rest)",
      ),
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/parts/x-link.tsx: handles a function form of render')
  })

  it('passes a link through renderLink and rejects one cloned by hand', () => {
    const through = [
      "import { renderLink } from '#shared/link.js'",
      'export function X({ link, href }: XProps) {',
      "  return renderLink('X', link, href, {})",
      '}',
    ].join('\n')
    expect(run({ 'src/components/x/index.tsx': through }).status).toBe(0)
    const result = run({
      'src/components/x/index.tsx': through
        .replace("import { renderLink } from '#shared/link.js'", "import { cloneElement } from 'react'")
        .replace("renderLink('X', link, href, {})", 'cloneElement(link ?? <a />, { href })'),
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/index.tsx: takes a link prop without calling renderElement')
  })

  it('rejects useRender in a demo, which the CLI copies into a server tree', () => {
    const result = run({
      'src/components/x/dummy/basic.tsx': "import { useRender } from '@base-ui/react/use-render'\nexport const Basic = () => useRender({ render: <a /> })\n",
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/components/x/dummy/basic.tsx: useRender calls hooks')
  })

  it('does not hold a demo or a test to the render-prop half', () => {
    const cloned = SERVER_LINK.replace('renderElement(render ?? <a />, rest)', 'cloneElement(render ?? <a />, rest)')
    const result = run({
      'src/components/x/dummy/basic.tsx': cloned,
      'src/components/x/test/x.test.tsx': cloned,
      'src/test/helpers.tsx': "import { useRender } from '@base-ui/react/use-render'\n" + cloned,
    })
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })
})
