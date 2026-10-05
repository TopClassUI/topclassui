import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

import { DIRECTIONS, MODES, pageName } from '../scripts/lib/harness.js'

const OUT = join(process.cwd(), '.harness')

/** Built by `pnpm harness:build`, which `pnpm test:e2e` runs first. */
export const DEMOS: string[] = JSON.parse(
  readFileSync(join(OUT, 'pages.json'), 'utf8'),
) as string[]

export const urlFor = (demo: string, mode: string, direction: string) =>
  pathToFileURL(join(OUT, pageName(demo, mode as never, direction as never))).href

export const EVERY_PAGE = DEMOS.flatMap((demo) =>
  MODES.flatMap((mode) => DIRECTIONS.map((direction) => ({ demo, mode, direction }))))
