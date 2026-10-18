import { describe, expect, it } from 'vitest'

import { addImports, importLines } from '../src/lib/css.js'
import { diffLines, splitLines, unifiedDiff } from '../src/lib/line-diff.js'
import { fileState, replaces, serializeConfig, type Config } from '../src/lib/lock.js'
import { closest, distance, resolveOrder } from '../src/lib/resolve.js'
import { minVersion, satisfies } from '../src/lib/semver.js'
import type { IndexEntry } from '../src/lib/registry.js'

describe('the five states of a copied file', () => {
  it('reads each state from the local, written and upstream hashes', () => {
    expect(fileState('a', 'a', 'a')).toBe('up to date')
    expect(fileState('a', 'a', 'b')).toBe('update available')
    expect(fileState('x', 'a', 'a')).toBe('modified locally')
    expect(fileState('x', 'a', 'b')).toBe('both changed')
    expect(fileState(undefined, 'a', 'b')).toBe('new')
    expect(fileState('x', undefined, 'b')).toBe('unknown file')
  })

  it('counts a file on disk that matches upstream as up to date, lock or not', () => {
    expect(fileState('b', undefined, 'b')).toBe('up to date')
  })

  it('replaces only untouched files, and edited ones under --overwrite', () => {
    expect(replaces('update available', false)).toBe(true)
    expect(replaces('new', false)).toBe(true)
    expect(replaces('modified locally', false)).toBe(false)
    expect(replaces('both changed', false)).toBe(false)
    expect(replaces('both changed', true)).toBe(true)
    expect(replaces('unknown file', true)).toBe(true)
    expect(replaces('modified locally', true)).toBe(false)
  })

  it('writes topclassui.json with sorted file keys and a trailing newline', () => {
    const config: Config = {
      version: 1,
      framework: 'next-app',
      css: 'src/app/globals.css',
      dir: 'src/topclassui',
      imports: 'relative',
      packageManager: 'pnpm',
      lock: {
        registry: '0.1.0',
        files: {
          'shared/cn.ts': { from: 'base', version: '0.1.0', sha256: 'b' },
          'components/svg/index.tsx': { from: 'svg', version: '0.1.0', sha256: 'a' },
        },
      },
    }
    const text = serializeConfig(config)
    expect(text.endsWith('}\n')).toBe(true)
    expect(text.indexOf('components/svg/index.tsx')).toBeLessThan(text.indexOf('shared/cn.ts'))
  })
})

describe('resolveOrder', () => {
  const entry = (name: string, registryDependencies: string[]): IndexEntry => ({
    name,
    type: 'registry:ui',
    title: name,
    registryDependencies,
    dependencies: [],
    icons: [],
    files: [],
  })
  const index = [entry('svg', []), entry('button', ['svg']), entry('toast', ['button', 'svg']), entry('dialog', ['svg'])]

  it('writes dependencies first, once each, and says who pulled them in', () => {
    expect(resolveOrder(index, ['toast', 'dialog'])).toEqual([
      { name: 'svg', via: 'button' },
      { name: 'button', via: 'toast' },
      { name: 'toast', via: null },
      { name: 'dialog', via: null },
    ])
  })

  it('marks a dependency the user also named as named', () => {
    expect(resolveOrder(index, ['dialog', 'svg'])).toEqual([
      { name: 'svg', via: null },
      { name: 'dialog', via: null },
    ])
  })

  it('refuses a cycle', () => {
    expect(() => resolveOrder([entry('a', ['b']), entry('b', ['a'])], ['a'])).toThrow('a -> b -> a')
  })

  it('offers the three closest names for a typo', () => {
    expect(distance('buton', 'button')).toBe(1)
    expect(closest('dialgo', ['dialog', 'drawer', 'badge', 'svg'])).toEqual(['dialog', 'badge', 'drawer'])
  })
})

describe('line diff', () => {
  it('handles empty input, an append, a delete and CRLF', () => {
    expect(splitLines('')).toEqual([])
    expect(diffLines([], ['a'])).toEqual([{ op: '+', line: 'a' }])
    expect(diffLines(['a', 'b'], ['a'])).toEqual([
      { op: ' ', line: 'a' },
      { op: '-', line: 'b' },
    ])
    expect(unifiedDiff('x.ts', 'a\r\nb\r\n', 'a\nb\n')).toBe('')
  })

  it('writes a unified hunk with three lines of context', () => {
    const before = ['1', '2', '3', '4', '5', '6', '7', '8'].join('\n')
    const after = ['1', '2', '3', '4', 'five', '6', '7', '8'].join('\n')
    expect(unifiedDiff('f.ts', before, after)).toBe(
      ['--- a/f.ts', '+++ b/f.ts', '@@ -2,7 +2,7 @@', ' 2', ' 3', ' 4', '-5', '+five', ' 6', ' 7', ' 8', ''].join('\n'),
    )
  })

  it('writes two hunks when the changes are far apart', () => {
    const before = Array.from({ length: 20 }, (_, i) => `l${String(i + 1)}`).join('\n')
    const after = before.replace('l2\n', 'L2\n').replace('l19\n', 'L19\n')
    const hunks = unifiedDiff('f.ts', before, after).split('\n').filter((l) => l.startsWith('@@'))
    expect(hunks).toEqual(['@@ -1,5 +1,5 @@', '@@ -16,5 +16,5 @@'])
  })
})

describe('the CSS entry', () => {
  it('imports the copied folder relative to the CSS file', () => {
    expect(importLines('src/app/globals.css', 'src/topclassui')).toEqual([
      '@import "../topclassui/tokens.css";',
      '@import "../topclassui/styles.css";',
    ])
    expect(importLines('src/index.css', 'src/topclassui')).toEqual([
      '@import "./topclassui/tokens.css";',
      '@import "./topclassui/styles.css";',
    ])
  })

  it('adds the lines after the tailwindcss import, once', () => {
    const lines = ['@import "./topclassui/tokens.css";', '@import "./topclassui/styles.css";']
    const first = addImports('@import "tailwindcss";\n\nbody {}\n', lines)
    expect(first.text).toBe('@import "tailwindcss";\n@import "./topclassui/tokens.css";\n@import "./topclassui/styles.css";\n\nbody {}\n')
    expect(addImports(first.text, lines)).toEqual({ text: first.text, added: [] })
  })

  it('adds the tailwindcss import first when the file has none, and keeps CRLF', () => {
    const lines = ['@import "./t/tokens.css";', '@import "./t/styles.css";']
    expect(addImports('body {}\r\n', lines).text).toBe('@import "tailwindcss";\r\n@import "./t/tokens.css";\r\n@import "./t/styles.css";\r\nbody {}\r\n')
  })
})

describe('versions', () => {
  it('reads the floor of a range and checks an installed version against it', () => {
    expect(minVersion('^19.1.0')).toEqual([19, 1, 0])
    expect(minVersion('workspace:*')).toBeNull()
    expect(satisfies('1.8.0', '1.8.0')).toBe(true)
    expect(satisfies('1.8.1', '1.8.0')).toBe(false)
    expect(satisfies('4.7.0', '^4.6.5')).toBe(true)
    expect(satisfies('5.0.0', '^4.6.5')).toBe(false)
    expect(satisfies('0.7.2', '^0.7.1')).toBe(true)
    expect(satisfies('0.8.0', '^0.7.1')).toBe(false)
  })
})
