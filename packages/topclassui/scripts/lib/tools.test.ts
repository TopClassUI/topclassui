import { describe, expect, it } from 'vitest'

import { binOf, pnpmCommand } from './tools.js'

describe('pnpmCommand', () => {
  it('runs pnpm.cjs through Node when pnpm started the script', () => {
    expect(pnpmCommand({ npm_execpath: 'C:\\npm\\node_modules\\pnpm\\bin\\pnpm.cjs' }, 'C:\\node.exe', ['pack', '--json']))
      .toEqual({ command: 'C:\\node.exe', args: ['C:\\npm\\node_modules\\pnpm\\bin\\pnpm.cjs', 'pack', '--json'] })
  })

  it('runs a standalone pnpm binary directly', () => {
    expect(pnpmCommand({ npm_execpath: '/usr/local/bin/pnpm' }, '/usr/bin/node', ['build']))
      .toEqual({ command: '/usr/local/bin/pnpm', args: ['build'] })
  })

  it('falls back to pnpm on PATH when nothing says where it is', () => {
    expect(pnpmCommand({}, '/usr/bin/node', ['build'])).toEqual({ command: 'pnpm', args: ['build'] })
    expect(pnpmCommand({ npm_execpath: '' }, '/usr/bin/node', ['build'])).toEqual({ command: 'pnpm', args: ['build'] })
  })
})

describe('binOf', () => {
  it('finds the attw and publint entry files the package installs', () => {
    expect(binOf(process.cwd(), '@arethetypeswrong/cli', 'attw').replace(/\\/g, '/')).toMatch(/node_modules\/@arethetypeswrong\/cli\/dist\/index\.js$/)
    expect(binOf(process.cwd(), 'publint', 'publint').replace(/\\/g, '/')).toMatch(/node_modules\/publint\/src\/cli\.js$/)
  })

  it('throws for a bin the package does not have', () => {
    expect(() => binOf(process.cwd(), 'publint', 'nope')).toThrow('publint has no bin named nope')
  })
})
