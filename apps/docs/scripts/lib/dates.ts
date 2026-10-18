// dateModified and the sitemap's lastModified come from git, never the build clock (docs-site S6).
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

/** The commit date of the newest commit that touched any of the paths, or null when none has. */
export function lastCommitDate(paths: string[], cwd: string): string | null {
  const tracked = paths.filter((p) => existsSync(p))
  if (tracked.length === 0) return null
  const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...tracked], { cwd, encoding: 'utf8' }).trim()
  // git writes UTC as +00:00 on Linux and as Z on Windows; one spelling keeps the pages and the sitemap byte-identical.
  return out === '' ? null : new Date(out).toISOString()
}

/** The newest of several ISO dates, compared as instants because the offsets may differ. */
export function newestOf(dates: (string | null)[]): string | null {
  return dates.reduce<string | null>((best, date) => {
    if (date === null) return best
    return best === null || Date.parse(date) > Date.parse(best) ? date : best
  }, null)
}
