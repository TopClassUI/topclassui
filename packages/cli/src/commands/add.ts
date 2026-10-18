// Plan 3.3 and 3.6: copy components and what they import, never over a file the user edited.
import type { Context } from '../context.js'
import { readIndex, readItem } from '../context.js'
import { installedItems } from '../lib/copy.js'
import { CliError, EXIT, type ExitCode } from '../lib/errors.js'
import { CONFIG_FILE } from '../lib/lock.js'
import { interactive, yes } from '../lib/prompt.js'
import { BASE, type RegistryIndex } from '../lib/registry.js'
import { closest } from '../lib/resolve.js'
import { runInit } from './init.js'
import { applyItems, installPackages, openSession, projectRoot, readConfig, saveConfig, type Flags } from './shared.js'

export function checkSlugs(index: RegistryIndex, slugs: readonly string[]): void {
  const names = index.items.map((i) => i.name).filter((n) => n !== BASE)
  for (const slug of slugs) {
    if (!names.includes(slug)) throw new CliError(`Unknown component "${slug}". Did you mean ${closest(slug, names).join(', ')}?`)
  }
}

/** --examples: the named items plus every component their demos import, so every demo is copied. */
export function withExampleComponents(ctx: Context, names: readonly string[]): string[] {
  const out = new Set(names)
  for (const name of names) {
    for (const example of Object.values(readItem(ctx, name).meta.topclassui.examples)) for (const c of example.components) out.add(c)
  }
  return [...out]
}

export async function add(ctx: Context, flags: Flags, slugs: string[]): Promise<ExitCode> {
  const index = readIndex(ctx)
  if (slugs.length === 0 && !flags.all && !flags.update) throw new CliError('Name a component: npx topclassui add button. Or pass --all or --update.')
  checkSlugs(index, slugs)

  let config = readConfig(ctx, projectRoot(ctx, flags))
  if (config === null) {
    const ask = interactive(flags.yes, ctx.env, ctx.tty)
    if (ask && !yes(await ctx.ask(`No ${CONFIG_FILE} here. Run init first?`, 'yes'))) {
      throw new CliError('add needs init first: npx topclassui init')
    }
    const first = await runInit(ctx, flags)
    if (first.code !== EXIT.ok) return first.code
    config = first.config
    if (!flags.silent) ctx.out('')
  }
  if (config === null) throw new CliError('add needs init first: npx topclassui init')

  const session = openSession(ctx, flags, config.dir)
  const names = flags.all
    ? index.items.map((i) => i.name).filter((n) => n !== BASE)
    : flags.update
      ? [...installedItems(config)].filter((n) => slugs.length === 0 || slugs.includes(n))
      : slugs
  const wanted = flags.examples === 'all' ? withExampleComponents(ctx, names) : names
  const result = applyItems(session, config, wanted, flags.update)
  saveConfig(session, config)
  const code = await installPackages(session, result.packages)
  if (code !== EXIT.ok) return code
  return result.conflicts.length > 0 ? EXIT.differs : EXIT.ok
}
