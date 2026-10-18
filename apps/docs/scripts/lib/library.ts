// Where the library lives, and the one place that reads its files: the site imports none of them.
import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { ComponentMeta } from '../../../../packages/topclassui/src/shared/meta.js'

export const LIBRARY = resolve(import.meta.dirname, '..', '..', '..', '..', 'packages', 'topclassui')
export const COMPONENTS = join(LIBRARY, 'src', 'components')

/** Every component folder, sorted: the 46 catalog cards, Field, Form and Meter, and the icon helpers. */
export function componentFolders(root = COMPONENTS): string[] {
  return readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
}

export async function metaOf(dir: string): Promise<ComponentMeta> {
  return ((await import(pathToFileURL(join(dir, 'meta.ts')).href)) as { meta: ComponentMeta }).meta
}

/** The demo names of one folder, sorted, without the extension. */
export function demoNamesOf(dir: string): string[] {
  const dummy = join(dir, 'dummy')
  return existsSync(dummy)
    ? readdirSync(dummy).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
    : []
}
