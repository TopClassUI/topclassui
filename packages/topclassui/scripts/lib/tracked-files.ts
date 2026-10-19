// A test that walks the disk also reads whatever a build, a branch switch or a crashed run
// left behind; git's own list holds only what a commit would carry.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Runs git with these arguments in `cwd` and returns its stdout; throws when git cannot. */
export type Git = (args: readonly string[], cwd: string) => string

export const runGit: Git = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })

/** Folders the fallback walk never enters, since no commit carries them. */
export const WALK_SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', '.harness', '.pack', 'test-results', 'playwright-report'])

/** Every file under `dir` at any depth, less WALK_SKIP: the list when git cannot answer. */
export function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (WALK_SKIP.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(path, out)
    else out.push(path)
  }
  return out
}

/**
 * Every file git tracks under `dir` that is still on disk, as absolute paths. Without git
 * or a repository, it warns once and walks the folder instead, untracked files included.
 */
export function trackedFiles(dir: string, git: Git = runGit, warn: (message: string) => void = console.warn): string[] {
  let listed: string
  try {
    listed = git(['ls-files', '-z', '--cached', '--', '.'], dir)
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error)
    warn(`git ls-files failed in ${dir} (${reason}); walking the folder instead, so untracked files are read too`)
    return walkFiles(dir)
  }
  return listed.split('\0').filter(Boolean).map((name) => join(dir, ...name.split('/'))).filter((path) => existsSync(path))
}
