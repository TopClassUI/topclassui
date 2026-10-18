import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { lastCommitDate, newestOf } from './dates.js'

const git = (cwd: string, args: string[], date: string) =>
  execFileSync('git', args, { cwd, env: { ...process.env, GIT_COMMITTER_DATE: date, GIT_AUTHOR_DATE: date } })

function repoWithTwoCommits(): string {
  const dir = mkdtempSync(join(tmpdir(), 'dates-'))
  execFileSync('git', ['init', '-q'], { cwd: dir })
  execFileSync('git', ['config', 'user.email', 'docs@example.com'], { cwd: dir })
  execFileSync('git', ['config', 'user.name', 'docs'], { cwd: dir })
  writeFileSync(join(dir, 'a.mdx'), 'a')
  git(dir, ['add', 'a.mdx'], '2026-01-02T03:04:05+00:00')
  git(dir, ['-c', 'commit.gpgsign=false', 'commit', '-qm', 'a'], '2026-01-02T03:04:05+00:00')
  writeFileSync(join(dir, 'b.mdx'), 'b')
  git(dir, ['add', 'b.mdx'], '2026-02-03T04:05:06+00:00')
  git(dir, ['-c', 'commit.gpgsign=false', 'commit', '-qm', 'b'], '2026-02-03T04:05:06+00:00')
  return dir
}

describe('lastCommitDate', () => {
  const dir = repoWithTwoCommits()

  it('returns the commit date of the newest commit that touched the path', () => {
    expect(lastCommitDate([join(dir, 'a.mdx')], dir)).toBe('2026-01-02T03:04:05.000Z')
  })

  it('takes the newest over several paths', () => {
    expect(lastCommitDate([join(dir, 'a.mdx'), join(dir, 'b.mdx')], dir)).toBe('2026-02-03T04:05:06.000Z')
  })

  it('returns null for a path that does not exist or was never committed', () => {
    expect(lastCommitDate([join(dir, 'missing.mdx')], dir)).toBeNull()
    writeFileSync(join(dir, 'new.mdx'), 'new')
    expect(lastCommitDate([join(dir, 'new.mdx')], dir)).toBeNull()
  })
})

describe('newestOf', () => {
  it('compares instants, not strings', () => {
    expect(newestOf(['2026-03-01T10:00:00+03:00', '2026-03-01T08:30:00+00:00', null])).toBe('2026-03-01T08:30:00+00:00')
  })

  it('returns null when every date is null', () => {
    expect(newestOf([null, null])).toBeNull()
  })
})
