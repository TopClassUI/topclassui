import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { changelogFacts, parseChangelog, releaseToc } from './changelog.js'

const FIXTURE = join(import.meta.dirname, '..', 'fixtures')

describe('parseChangelog', () => {
  it('reads the 0.1.0-beta.0 changelog the release wrote', () => {
    const [release, ...rest] = parseChangelog(readFileSync(join(FIXTURE, 'CHANGELOG.md'), 'utf8'))
    expect(rest).toEqual([])
    expect(release?.version).toBe('0.1.0-beta.0')
    expect(release?.groups.map((group) => group.title)).toEqual(['Minor Changes'])
    const [item] = release?.groups[0]?.items ?? []
    expect(item?.text.startsWith('First beta. 52 component entries as subpath imports')).toBe(true)
    expect(item?.text.endsWith('size budgets, provenance.')).toBe(true)
    expect(item?.children).toEqual([])
  })

  it('drops the commit hash, keeps sub-items and joins continued lines', () => {
    const md = [
      '# topclassui',
      '',
      '## 0.2.0',
      '',
      '### Major Changes',
      '',
      '- abc1234: `Card` is now `CardRoot`.',
      '  Find and replace.',
      '',
      '### Patch Changes',
      '',
      '- Updated dependencies',
      '  - zod@4.7.0',
      '',
      '## 0.1.0',
      '',
      'The first release.',
    ].join('\n')
    expect(parseChangelog(md)).toEqual([
      {
        version: '0.2.0',
        groups: [
          { title: 'Major Changes', items: [{ text: '`Card` is now `CardRoot`. Find and replace.', children: [] }] },
          { title: 'Patch Changes', items: [{ text: 'Updated dependencies', children: ['zod@4.7.0'] }] },
        ],
      },
      { version: '0.1.0', groups: [{ title: null, items: [{ text: 'The first release.', children: [] }] }] },
    ])
  })

  it('reads nothing from a changelog with no release yet', () => {
    expect(parseChangelog('# topclassui\n')).toEqual([])
  })
})

describe('changelogFacts', () => {
  it('has no release when the package has no CHANGELOG.md', () => {
    expect(changelogFacts(join(FIXTURE, 'no-such-package'))).toEqual({ releases: [] })
  })

  it('reads the file from the package root', () => {
    expect(changelogFacts(FIXTURE).releases.map((release) => release.version)).toEqual(['0.1.0-beta.0'])
  })
})

describe('releaseToc', () => {
  it('gives each release the id its heading gets', () => {
    expect(releaseToc({ releases: [{ version: '0.1.0-beta.0', groups: [] }] })).toEqual([{ text: '0.1.0-beta.0', id: '0-1-0-beta-0' }])
  })
})
