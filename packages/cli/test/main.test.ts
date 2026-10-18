import { describe, expect, it } from 'vitest'

import { projectRoot, type Flags } from '../src/commands/shared.js'
import type { Context } from '../src/context.js'
import { ancestors, memoryFiles } from '../src/lib/files.js'
import { jsoncReader } from '../src/lib/tsconfig.js'
import { main, parse } from '../src/main.js'

function context(lines: string[], cwd = '/nowhere'): Context {
  const files = memoryFiles({})
  return {
    cwd,
    env: {},
    tty: false,
    files,
    registry: '/no-registry',
    out: (line) => lines.push(line),
    err: (line) => lines.push(`ERR ${line}`),
    ask: () => Promise.reject(new Error('asked')),
    run: () => Promise.reject(new Error('ran')),
    readProject: () => jsoncReader(files),
  }
}

describe('main', () => {
  it('prints the help with exit 0, and with exit 2 when no command is given', async () => {
    const lines: string[] = []
    expect(await main(['--help'], context(lines))).toBe(0)
    expect(lines[0]?.split('\n')[0]).toBe('Usage: npx topclassui <command> [options]')
    expect(await main([], context([]))).toBe(2)
  })

  it('fails with exit 2 on an unknown flag, a contradiction or an unknown command', async () => {
    const lines: string[] = []
    expect(await main(['add', '--frobnicate'], context(lines))).toBe(2)
    expect(lines[0]).toContain("Unknown option '--frobnicate'")
    expect(await main(['add', '--examples', '--no-examples'], context([]))).toBe(2)
  })

  it('says the registry is missing rather than throwing', async () => {
    const lines: string[] = []
    expect(await main(['list'], context(lines))).toBe(2)
    expect(lines).toEqual(['ERR The registry is missing index.json (looked in /no-registry). Reinstall topclassui.'])
  })

  it('reads the flags of plan 3.7', () => {
    const { command, rest, flags } = parse(['add', 'dialog', 'select', '-y', '--dry-run', '--no-install', '--overwrite', '--no-examples', '--cwd', 'apps/web'])
    expect([command, rest]).toEqual(['add', ['dialog', 'select']])
    expect([flags.yes, flags.dryRun, flags.noInstall, flags.overwrite, flags.examples, flags.cwd]).toEqual([true, true, true, true, 'none', 'apps/web'])
  })
})

describe('paths', () => {
  const flags = (cwd: string | undefined): Flags => ({ ...parse(['list']).flags, cwd })
  it('resolves --cwd against the current folder, and keeps an absolute or Windows drive path', () => {
    expect(projectRoot(context([], '/home/me'), flags('apps/web/'))).toBe('/home/me/apps/web')
    expect(projectRoot(context([], '/home/me'), flags(undefined))).toBe('/home/me')
    expect(projectRoot(context([], '/home/me'), flags('/srv/app'))).toBe('/srv/app')
  })

  it('walks up to the root, a drive root included', () => {
    expect(ancestors('/a/b')).toEqual(['/a/b', '/a', '/'])
    expect(ancestors('C:\\work\\app')).toEqual(['C:/work/app', 'C:/work', 'C:'])
  })
})
