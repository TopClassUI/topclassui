// Every item in the registry, whether it is in the lock and at which version.
import type { Context } from '../context.js'
import { readIndex } from '../context.js'
import { EXIT, type ExitCode } from '../lib/errors.js'
import type { Config } from '../lib/lock.js'
import { BASE } from '../lib/registry.js'
import { projectRoot, readConfig, type Flags } from './shared.js'

export interface Row {
  name: string
  title: string
  added: boolean
  version: string | null
  dependsOn: string[]
}

export function listRows(names: { name: string; title: string; registryDependencies: string[] }[], config: Config | null): Row[] {
  const versions = new Map<string, string>()
  for (const entry of Object.values(config?.lock.files ?? {})) versions.set(entry.from, entry.version)
  return names
    .filter((i) => i.name !== BASE)
    .map((i) => ({
      name: i.name,
      title: i.title,
      added: versions.has(i.name),
      version: versions.get(i.name) ?? null,
      dependsOn: i.registryDependencies,
    }))
}

export function list(ctx: Context, flags: Flags): ExitCode {
  const index = readIndex(ctx)
  const config = readConfig(ctx, projectRoot(ctx, flags))
  const rows = listRows(index.items, config)
  if (flags.json) {
    ctx.out(JSON.stringify({ version: index.version, items: rows }, null, 2))
    return EXIT.ok
  }
  const width = Math.max(...rows.map((r) => r.name.length))
  ctx.out(`topclassui ${index.version}: ${String(rows.length)} components`)
  for (const r of rows) {
    const state = r.added ? `added ${r.version ?? ''}` : ''
    ctx.out(`  ${r.name.padEnd(width)}  ${r.title.padEnd(18)}  ${state}`.trimEnd())
  }
  return EXIT.ok
}
