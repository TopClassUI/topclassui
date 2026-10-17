// The package runs its scripts from packages/topclassui; the generated rule files live at the repo root.
import { dirname, join } from 'node:path'

export const WORKSPACE_FILE = 'pnpm-workspace.yaml'

/** The nearest folder at or above `start` holding pnpm-workspace.yaml, or null when none does. */
export function findRepoRoot(start: string, exists: (path: string) => boolean): string | null {
  let dir = start
  for (;;) {
    if (exists(join(dir, WORKSPACE_FILE))) return dir
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}
