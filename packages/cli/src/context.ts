// Everything a command touches outside its arguments, so a test runs a command against a temp folder.
import { existsSync, readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CliError } from './lib/errors.js'
import { nodeFiles, type Files } from './lib/files.js'
import { terminalAsk, type Ask } from './lib/prompt.js'
import { runCommand } from './lib/install.js'
import type { IconData, RegistryIndex, RegistryItem } from './lib/registry.js'
import { toPosix } from './lib/specifiers.js'
import { jsoncReader, loadTypeScript, typescriptReader, type ReadProject } from './lib/tsconfig.js'

export interface Context {
  cwd: string
  env: Record<string, string | undefined>
  tty: boolean
  files: Files
  /** The folder holding index.json, base.json, icon-data.json and one JSON per component. */
  registry: string
  out(line: string): void
  err(line: string): void
  ask: Ask
  run(cmd: string, args: string[], cwd: string): Promise<number>
  /** The project's own TypeScript reads its tsconfig; the built-in reader stands in where it cannot. */
  readProject(root: string): ReadProject
}

/** dist/cli/index.js reads dist/registry/, its sibling in the same tarball. */
export const DEFAULT_REGISTRY = toPosix(fileURLToPath(new URL('../registry/', import.meta.url)))

export function nodeContext(): Context {
  return {
    cwd: toPosix(process.cwd()),
    env: process.env,
    tty: process.stdin.isTTY,
    files: nodeFiles,
    registry: DEFAULT_REGISTRY,
    out: (line) => {
      process.stdout.write(`${line}\n`)
    },
    err: (line) => {
      process.stderr.write(`${line}\n`)
    },
    ask: terminalAsk,
    run: runCommand,
    readProject: (root) => {
      const ts = loadTypeScript(root)
      return ts === null ? jsoncReader(nodeFiles) : typescriptReader(ts)
    },
  }
}

function readRegistryJson(ctx: Context, name: string): unknown {
  const path = posix.join(ctx.registry, name)
  if (!existsSync(path)) throw new CliError(`The registry is missing ${name} (looked in ${ctx.registry}). Reinstall topclassui.`)
  return JSON.parse(readFileSync(path, 'utf8'))
}

export const readIndex = (ctx: Context): RegistryIndex => readRegistryJson(ctx, 'index.json') as RegistryIndex
export const readItem = (ctx: Context, name: string): RegistryItem => readRegistryJson(ctx, `${name}.json`) as RegistryItem
export const readIcons = (ctx: Context): IconData => readRegistryJson(ctx, 'icon-data.json') as IconData
