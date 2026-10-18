// npx topclassui <init|add|diff|list>: argument parsing, dispatch and exit codes (plan 3.7).
import { parseArgs } from 'node:util'

import { add } from './commands/add.js'
import { diff } from './commands/diff.js'
import { init } from './commands/init.js'
import { list } from './commands/list.js'
import type { Flags } from './commands/shared.js'
import { readIndex, type Context } from './context.js'
import { CliError, EXIT, type ExitCode } from './lib/errors.js'

export const HELP = `Usage: npx topclassui <command> [options]

Commands
  init                 detect the project, copy shared code, add two lines to the CSS entry
  add <slug...>        copy components and what they import; --all, --update
  diff [slug...]       compare the copies with this version; exit 1 when something differs
  list                 every component, and which ones are added

Options
  --cwd <dir>          the project root (default: the current folder)
  -y, --yes            accept every default without asking
  --dry-run            print what would be written; write and install nothing
  --no-install         print the install command instead of running it
  --silent             print errors only
  --css <file>         init: the CSS file that imports tailwindcss
  --dir <path>         init: the folder for the copies (default src/topclassui or topclassui)
  --pm <name>          npm, pnpm, yarn or bun
  --force              init: run again over an existing topclassui.json
  --overwrite          add: replace files you edited, printing the diff first
  --examples           add: also add the components the demos need
  --no-examples        add: copy no demos
  --json               list: print JSON
  -v, --version        print the version
  -h, --help           print this help`

const OPTIONS = {
  cwd: { type: 'string' },
  yes: { type: 'boolean', short: 'y' },
  'dry-run': { type: 'boolean' },
  'no-install': { type: 'boolean' },
  silent: { type: 'boolean' },
  css: { type: 'string' },
  dir: { type: 'string' },
  pm: { type: 'string' },
  imports: { type: 'string' },
  force: { type: 'boolean' },
  all: { type: 'boolean' },
  update: { type: 'boolean' },
  overwrite: { type: 'boolean' },
  examples: { type: 'boolean' },
  'no-examples': { type: 'boolean' },
  json: { type: 'boolean' },
  'exit-code': { type: 'boolean' },
  version: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' },
} as const

export function parse(argv: string[]): { command: string | undefined; rest: string[]; flags: Flags; help: boolean; version: boolean } {
  let parsed
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true })
  } catch (error) {
    throw new CliError(`${error instanceof Error ? error.message : String(error)}\nRun npx topclassui --help.`)
  }
  const { values, positionals } = parsed
  if (values.examples === true && values['no-examples'] === true) throw new CliError('--examples and --no-examples contradict each other.')
  const flags: Flags = {
    cwd: values.cwd,
    yes: values.yes === true,
    dryRun: values['dry-run'] === true,
    noInstall: values['no-install'] === true,
    silent: values.silent === true,
    force: values.force === true,
    css: values.css,
    dir: values.dir,
    pm: values.pm,
    imports: values.imports,
    all: values.all === true,
    update: values.update === true,
    overwrite: values.overwrite === true,
    examples: values.examples === true ? 'all' : values['no-examples'] === true ? 'none' : 'present',
    json: values.json === true,
    exitCode: values['exit-code'] === true,
  }
  return { command: positionals[0], rest: positionals.slice(1), flags, help: values.help === true, version: values.version === true }
}

export async function main(argv: string[], ctx: Context): Promise<ExitCode> {
  try {
    const { command, rest, flags, help, version } = parse(argv)
    if (version) {
      ctx.out(readIndex(ctx).version)
      return EXIT.ok
    }
    if (help || command === undefined) {
      ctx.out(HELP)
      return command === undefined && !help ? EXIT.usage : EXIT.ok
    }
    if (!flags.silent && command !== 'list') ctx.out(`topclassui ${readIndex(ctx).version}`)
    switch (command) {
      case 'init':
        return await init(ctx, flags)
      case 'add':
        return await add(ctx, flags, rest)
      case 'diff':
        return diff(ctx, flags, rest)
      case 'list':
        return list(ctx, flags)
      default:
        throw new CliError(`Unknown command "${command}". Run npx topclassui --help.`)
    }
  } catch (error) {
    if (error instanceof CliError) {
      ctx.err(error.message)
      return error.code
    }
    throw error
  }
}
