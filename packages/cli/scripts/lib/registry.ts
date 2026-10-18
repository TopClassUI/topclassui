// The pure half of the registry build: from the library's src/ as a map of path to text, the items,
// the index and every reason the build must fail. No file system here, so a test feeds a fake tree.
import { posix } from 'node:path'

import {
  BASE,
  ITEM_SCHEMA,
  iconPath,
  withRange,
  type Example,
  type IconData,
  type IndexEntry,
  type RegistryIndex,
  type RegistryItem,
} from '../../src/lib/registry.js'
import { aliasTarget, isLocal, packageName, specifiersOf } from '../../src/lib/specifiers.js'

export interface Library {
  version: string
  /** `dependencies` and `peerDependencies` of the library's package.json. */
  dependencies: Record<string, string>
  peers: Record<string, string>
  /** Every file under src/, keyed by its POSIX path relative to src/. */
  files: Map<string, string>
}

export interface Registry {
  index: RegistryIndex
  items: RegistryItem[]
  icons: IconData
  errors: string[]
}

/** The icon runtime every copy needs; the loader map stays with `icon`, which imports all 84 icons. */
const ICON_RUNTIME = new Set([
  'icons/index.ts',
  'icons/types.ts',
  'icons/names.generated.ts',
  'icons/directional.generated.ts',
  'icons/version.generated.ts',
])

/** Shipped strings that may name the package; the copy rewrites the first, the second is a command name. */
export const PACKAGE_STRING_ALLOWED = new Set(['components/icon-registry/index.tsx'])

const SOURCE = /\.tsx?$/

/** Tests, their helpers, READMEs and the docs metadata never ship (plan 3.3). */
export function isShipped(path: string): boolean {
  if (path.startsWith('test/') || path.includes('/test/') || /\.test\.tsx?$/.test(path)) return false
  if (path.endsWith('README.md') || path === 'shared/meta.ts') return false
  if (/^components\/[^/]+\/meta\.ts$/.test(path)) return false
  return SOURCE.test(path) || path === 'tokens.css' || path === 'styles.css'
}

export const isDemo = (path: string): boolean => /^components\/[^/]+\/dummy\//.test(path)

export function isBase(path: string): boolean {
  if (path === 'tokens.css' || path === 'styles.css' || ICON_RUNTIME.has(path)) return true
  return path.startsWith('shared/') && isShipped(path)
}

const componentOf = (path: string): string | null => /^components\/([^/]+)\//.exec(path)?.[1] ?? null
const iconOf = (path: string): string | null => /^icons\/data\/([^/]+)\.ts$/.exec(path)?.[1] ?? null

/** `./x.js` from a file to the file it names, trying `.ts` and `.tsx` the way TypeScript does. */
export function resolveLocal(from: string, specifier: string, files: ReadonlyMap<string, string>): string | null {
  const target = specifier.startsWith('#') ? aliasTarget(specifier) : posix.join(posix.dirname(from), specifier)
  if (target === null) return null
  const stem = target.replace(/\.js$/, '')
  for (const candidate of [target, `${stem}.ts`, `${stem}.tsx`, `${stem}/index.ts`, `${stem}/index.tsx`]) {
    if (files.has(candidate)) return candidate
  }
  return null
}

interface Reach {
  files: Set<string>
  components: Set<string>
  icons: Set<string>
  packages: Set<string>
}

/** Walks the imports from `start`, stopping at base files, icon data and other components' folders. */
function walk(lib: Library, start: string[], self: string | null, errors: string[]): Reach {
  const reach: Reach = { files: new Set(), components: new Set(), icons: new Set(), packages: new Set() }
  const queue = [...start]
  const known = { ...lib.dependencies, ...lib.peers }
  while (queue.length > 0) {
    const file = queue.pop()
    if (file === undefined || reach.files.has(file)) continue
    reach.files.add(file)
    for (const specifier of specifiersOf(lib.files.get(file) ?? '')) {
      if (!isLocal(specifier)) {
        const name = packageName(specifier)
        if (known[name] === undefined) errors.push(`${file}: imports ${name}, which is not a dependency of the library`)
        else reach.packages.add(name)
        continue
      }
      if (specifier.startsWith('#') && aliasTarget(specifier) === null) {
        errors.push(`${file}: '${specifier}' is not an alias the copy can rewrite`)
        continue
      }
      const target = resolveLocal(file, specifier, lib.files)
      if (target === null) {
        errors.push(`${file}: '${specifier}' names no file`)
        continue
      }
      if (!isShipped(target)) {
        errors.push(`${file}: '${specifier}' reaches ${target}, which is never copied`)
        continue
      }
      const icon = iconOf(target)
      const component = componentOf(target)
      if (icon !== null) reach.icons.add(icon)
      else if (component !== null && component !== self) reach.components.add(component)
      else if (!isBase(target) || self === BASE) queue.push(target)
    }
  }
  return reach
}

const sorted = (values: Iterable<string>): string[] => [...values].sort()

function titleOf(lib: Library, slug: string): string {
  const meta = lib.files.get(`components/${slug}/meta.ts`) ?? ''
  return /\bname:\s*'([^']+)'/.exec(meta)?.[1] ?? slug
}

function item(
  lib: Library,
  name: string,
  type: RegistryItem['type'],
  reach: Reach,
  examples: Record<string, Example>,
  demos: string[],
): RegistryItem {
  const paths = sorted([...reach.files, ...demos])
  return {
    $schema: ITEM_SCHEMA,
    name,
    type,
    title: type === 'registry:base' ? 'Base' : titleOf(lib, name),
    dependencies: sorted(reach.packages).map((p) => withRange(p, lib.dependencies)),
    registryDependencies: sorted(reach.components),
    files: paths.map((path) => ({
      path,
      type: 'registry:file',
      target: `~/topclassui/${path}`,
      content: lib.files.get(path) ?? '',
    })),
    meta: {
      topclassui: {
        version: lib.version,
        icons: sorted(reach.icons),
        examples,
        client: paths.filter((p) => /^(['"])use client\1/.test(lib.files.get(p) ?? '')),
      },
    },
  }
}

/** The order in which `name` and its registry dependencies are written, or the cycle that forbids one. */
export function findCycle(graph: ReadonlyMap<string, readonly string[]>): string[] | null {
  const state = new Map<string, 'open' | 'done'>()
  const visit = (node: string, path: string[]): string[] | null => {
    if (state.get(node) === 'done') return null
    if (state.get(node) === 'open') return [...path.slice(path.indexOf(node)), node]
    state.set(node, 'open')
    for (const next of graph.get(node) ?? []) {
      const cycle = visit(next, [...path, node])
      if (cycle !== null) return cycle
    }
    state.set(node, 'done')
    return null
  }
  for (const node of graph.keys()) {
    const cycle = visit(node, [])
    if (cycle !== null) return cycle
  }
  return null
}

function packageStrings(lib: Library, errors: string[]): void {
  for (const [path, code] of lib.files) {
    if (!isShipped(path) || isDemo(path) || PACKAGE_STRING_ALLOWED.has(path)) continue
    if (/['"`]topclassui\b/.test(code)) errors.push(`${path}: names the topclassui package, which a copy may not have`)
  }
}

export function buildRegistry(lib: Library): Registry {
  const errors: string[] = []
  const paths = sorted(lib.files.keys())
  const slugs = sorted(new Set(paths.filter((p) => /^components\/[^/]+\/index\.tsx$/.test(p)).map((p) => componentOf(p) ?? '')))

  const baseReach = walk(lib, paths.filter(isBase), BASE, errors)
  const items = [item(lib, BASE, 'registry:base', baseReach, {}, [])]

  for (const slug of slugs) {
    const own = paths.filter((p) => componentOf(p) === slug && isShipped(p))
    const reach = walk(lib, own.filter((p) => !isDemo(p)), slug, errors)
    const examples: Record<string, Example> = {}
    for (const demo of own.filter(isDemo)) {
      const demoReach = walk(lib, [demo], slug, errors)
      const stray = [...demoReach.files].filter((f) => f !== demo && componentOf(f) === slug && isDemo(f))
      if (stray.length > 0) errors.push(`${demo}: imports another demo, ${stray.join(', ')}`)
      examples[demo] = { components: sorted(demoReach.components), icons: sorted(demoReach.icons) }
    }
    items.push(item(lib, slug, 'registry:ui', reach, examples, own.filter(isDemo)))
  }

  const graph = new Map(items.map((i) => [i.name, i.registryDependencies]))
  for (const i of items) {
    for (const dep of i.registryDependencies) if (!graph.has(dep)) errors.push(`${i.name}: depends on ${dep}, which has no index.tsx`)
  }
  const cycle = findCycle(graph)
  if (cycle !== null) errors.push(`registry dependencies form a cycle: ${cycle.join(' -> ')}`)
  packageStrings(lib, errors)

  const icons: IconData = {}
  for (const path of paths) {
    const name = iconOf(path)
    if (name !== null && isShipped(path)) icons[name] = lib.files.get(path) ?? ''
  }
  for (const i of items) {
    for (const name of i.meta.topclassui.icons) if (icons[name] === undefined) errors.push(`${i.name}: icon ${name} has no ${iconPath(name)}`)
  }

  const entries: IndexEntry[] = items.map((i) => ({
    name: i.name,
    type: i.type,
    title: i.title,
    registryDependencies: i.registryDependencies,
    dependencies: i.dependencies.map((d) => d.replace(/(?<=.)@[^@]*$/, '')),
    icons: i.meta.topclassui.icons,
    files: i.files.map((f) => f.path),
  }))
  return { index: { version: lib.version, packages: lib.dependencies, items: entries }, items, icons, errors }
}
