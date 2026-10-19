// pnpm size, as pure functions over esbuild's metafile, the gzipped chunk sizes and the two JSON files.

/** Left out of the own number: React and the shared Base UI core, which every page pays once (PLAN 14). */
export const OWN_EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', '@base-ui/react', '@base-ui/react/*'] as const
/** Left out of the number with Base UI: React only. */
export const BASE_UI_EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime'] as const

/** The one module whose chunk is the class-merging runtime (cn, clsx, tailwind-merge), paid once per page. */
export const RUNTIME_INPUT = 'dist/shared/cn.js'

export interface MetaImport {
  path: string
  kind: string
  external?: boolean
}

export interface MetaOutput {
  entryPoint?: string
  imports: MetaImport[]
  inputs: Record<string, unknown>
}

export type Outputs = Record<string, MetaOutput>

export interface Closure {
  eager: string[]
  lazy: string[]
}

/** The chunks an entry loads at once (static imports) and the ones it loads on demand (dynamic imports and theirs). */
export function closureOf(outputs: Outputs, entry: string): Closure {
  const walk = (start: string[], skip: Set<string>) => {
    const seen = new Set<string>()
    const later: string[] = []
    const stack = [...start]
    while (stack.length > 0) {
      const path = stack.pop() as string
      if (seen.has(path) || skip.has(path)) continue
      seen.add(path)
      for (const imported of outputs[path]?.imports ?? []) {
        if (imported.external === true) continue
        if (imported.kind === 'import-statement') stack.push(imported.path)
        else if (imported.kind === 'dynamic-import') later.push(imported.path)
      }
    }
    return { seen, later }
  }
  const eager = walk([entry], new Set())
  const lazy = walk(eager.later, eager.seen)
  return { eager: [...eager.seen].sort(), lazy: [...lazy.seen].sort() }
}

/** The output that carries a component's client.js as its entry, keyed by slug. */
export function entriesBySlug(outputs: Outputs): Map<string, string> {
  const entries = new Map<string, string>()
  for (const [path, output] of Object.entries(outputs)) {
    const slug = /(?:^|\/)components\/([^/]+)\/client\.js$/.exec(output.entryPoint ?? '')?.[1]
    if (slug !== undefined) entries.set(slug, path)
  }
  return entries
}

export function runtimeChunkOf(outputs: Outputs): string | null {
  return Object.entries(outputs).find(([, output]) => RUNTIME_INPUT in output.inputs)?.[0] ?? null
}

export interface ComponentSize {
  clientBytes: number
  lazyBytes: number
  withBaseUiBytes: number
  budgetedBytes: number
}

export interface SizeFile {
  tool: string
  runtimeBytes: number
  components: Record<string, ComponentSize>
}

const sum = (paths: readonly string[], gzipped: (path: string) => number) => paths.reduce((total, path) => total + gzipped(path), 0)

/** Own (eager) bytes, lazy bytes and, without the runtime chunk, the bytes the budget holds, for every entry. */
export function ownSizes(outputs: Outputs, gzipped: (path: string) => number): Map<string, Omit<ComponentSize, 'withBaseUiBytes'>> {
  const runtime = runtimeChunkOf(outputs)
  const sizes = new Map<string, Omit<ComponentSize, 'withBaseUiBytes'>>()
  for (const [slug, entry] of entriesBySlug(outputs)) {
    const { eager, lazy } = closureOf(outputs, entry)
    const clientBytes = sum(eager, gzipped)
    const runtimeBytes = runtime !== null && eager.includes(runtime) ? gzipped(runtime) : 0
    sizes.set(slug, { clientBytes, lazyBytes: sum(lazy, gzipped), budgetedBytes: clientBytes - runtimeBytes })
  }
  return sizes
}

export type BudgetClass = 'simple' | 'overlay' | 'lazy'

/** A class alone takes the class's budget; an object raises it for one component and keeps the class's other rules. */
export type BudgetRule = BudgetClass | { class: BudgetClass; kb: number }

export interface BudgetFile {
  kb: Record<BudgetClass, number>
  components: Record<string, BudgetRule>
}

export function budgetKbOf(rule: BudgetRule, kb: Record<BudgetClass, number>): number {
  return typeof rule === 'string' ? kb[rule] : rule.kb
}

export const KB = 1024

/** One decimal, as the chip prints it. */
export function formatKb(bytes: number): string {
  return `${(Math.round((bytes / KB) * 10) / 10).toFixed(1)} KB`
}

/** Every component over its budget, every measured one with no budget and every budget with nothing measured. */
export function budgetProblems(file: SizeFile, budget: BudgetFile): string[] {
  const problems: string[] = []
  for (const [slug, size] of Object.entries(file.components)) {
    const rule = budget.components[slug]
    if (rule === undefined) {
      problems.push(`${slug}: no budget in size-budget.json`)
      continue
    }
    const limit = Math.round(budgetKbOf(rule, budget.kb) * KB)
    if (size.budgetedBytes > limit) problems.push(`${slug}: ${size.budgetedBytes} bytes is over its budget of ${limit} (${formatKb(limit)})`)
    if ((typeof rule === 'string' ? rule : rule.class) === 'lazy' && size.lazyBytes === 0) problems.push(`${slug}: budgeted as lazy, but it loads no chunk on demand`)
  }
  for (const slug of Object.keys(budget.components)) {
    if (!(slug in file.components)) problems.push(`${slug}: in size-budget.json, but it has no client.js`)
  }
  return problems
}

/** A gzip of the same bundle may differ by a few bytes between zlib builds, so a smaller move is not stale. */
export const STALE_TOLERANCE_BYTES = 64

const moved = (a: number, b: number) => Math.abs(a - b) > STALE_TOLERANCE_BYTES

/** Where the committed size.json disagrees with a fresh measurement by more than the tolerance. */
export function staleProblems(committed: SizeFile, fresh: SizeFile): string[] {
  const problems: string[] = []
  const slugs = new Set([...Object.keys(committed.components), ...Object.keys(fresh.components)])
  if (moved(committed.runtimeBytes, fresh.runtimeBytes)) problems.push(`runtimeBytes is ${fresh.runtimeBytes}, size.json says ${committed.runtimeBytes}`)
  for (const slug of [...slugs].sort()) {
    const a = committed.components[slug]
    const b = fresh.components[slug]
    if (a === undefined || b === undefined) {
      problems.push(`${slug}: ${a === undefined ? 'missing from' : 'no longer measured but still in'} size.json`)
      continue
    }
    for (const key of ['clientBytes', 'lazyBytes', 'withBaseUiBytes', 'budgetedBytes'] as const) {
      if (moved(a[key], b[key])) problems.push(`${slug}: ${key} is ${b[key]}, size.json says ${a[key]}`)
    }
  }
  return problems
}
