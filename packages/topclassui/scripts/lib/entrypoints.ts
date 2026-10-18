// attw skips every exports key with a `*`, so the subpaths a consumer really writes are listed here.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** The subpaths outside `./*`: the provider, the theme script, the helpers, both label files and the icon surface. */
export const FIXED_ENTRYPOINTS = [
  'provider',
  'theme',
  'cn',
  'classes',
  'labels/en',
  'labels/ar',
  'labels/get-labels',
  'labels/types',
  'icons',
  'icons/check',
] as const

/** One sample of each pattern that maps into a component folder. */
export const SAMPLE_ENTRYPOINTS = ['schemas/button', 'meta/button'] as const

/** Every subpath attw checks, as `./x`: the fixed ones, one per component, then the samples. */
export function entrypoints(componentSlugs: readonly string[]): string[] {
  return [...FIXED_ENTRYPOINTS, ...[...componentSlugs].sort(), ...SAMPLE_ENTRYPOINTS].map((entry) => `./${entry}`)
}

/** The folders under src/components that have an index.tsx, which `./*` resolves. */
export function componentSlugs(root: string): string[] {
  const components = join(root, 'src', 'components')
  return readdirSync(components, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(components, entry.name, 'index.tsx')))
    .map((entry) => entry.name)
    .sort()
}
