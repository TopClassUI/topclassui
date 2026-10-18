// How the package scripts spawn pnpm and a dev tool: an argument array and no shell, on every platform.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface Command {
  command: string
  args: string[]
}

/**
 * pnpm as the running script was started by it: npm_execpath names pnpm.cjs under `pnpm run`, which Node
 * runs directly, or a standalone binary. Without it, the plain `pnpm` on PATH.
 */
export function pnpmCommand(env: Record<string, string | undefined>, node: string, args: string[]): Command {
  const execpath = env['npm_execpath']
  if (execpath === undefined || execpath === '') return { command: 'pnpm', args }
  if (/\.[cm]?js$/.test(execpath)) return { command: node, args: [execpath, ...args] }
  return { command: execpath, args }
}

/** The JavaScript file behind a dev tool's `bin`, run through Node so Windows needs no .cmd shim. */
export function binOf(root: string, pkg: string, name: string): string {
  const dir = join(root, 'node_modules', pkg)
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { bin?: string | Record<string, string> }
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[name]
  if (bin === undefined) throw new Error(`${pkg} has no bin named ${name}`)
  return join(dir, bin)
}
