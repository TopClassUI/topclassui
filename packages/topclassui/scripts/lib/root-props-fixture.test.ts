import { describe, expect, it } from 'vitest'

import { ROOT_PROPS_FIXTURE, missingFixture } from './root-props-fixture.js'

describe('missingFixture', () => {
  it('passes a folder whose test/ holds the fixture', () => {
    expect(missingFixture('src/components/badge', ['badge.test.tsx', 'fixture.ts'])).toBeNull()
  })

  it('rejects a folder whose test/ has tests and no fixture', () => {
    expect(missingFixture('src/components/badge', ['badge.test.tsx'])).toBe(
      'src/components/badge: test/fixture.ts is required: the required props of each export, which the root-props test renders (R-5.7-3).',
    )
  })

  it('rejects a folder with no test/ at all', () => {
    expect(missingFixture('src/components/badge', [])).not.toBeNull()
  })

  it('does not take a fixture under another name', () => {
    expect(missingFixture('src/components/badge', ['fixtures.ts', 'fixture.tsx'])).not.toBeNull()
  })

  it('names the path the walk imports', () => {
    expect(ROOT_PROPS_FIXTURE).toBe('test/fixture.ts')
  })
})
