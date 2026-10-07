// The rules existing is not the same as the project arming them, and nothing else checks it.
import { describe, expect, it } from 'vitest'

import config from '../eslint.config.js'
import topclass from './index.js'

type Entry = { files?: string[]; rules?: Record<string, unknown>; plugins?: Record<string, unknown> }

const blocks = config as unknown as Entry[]
const RULE_NAMES = Object.keys(topclass.rules)

/** The block that arms the library's own rules, found by what it targets. */
const src = blocks.find((b) => (b.files ?? []).some((f) => f.startsWith('src/')) && b.plugins?.['topclass'])

describe('eslint.config.ts arms the custom rules', () => {
  it('has a block for src that registers the plugin', () => {
    expect(src).toBeDefined()
  })

  it('declares thirteen rules, so a new one cannot be forgotten silently', () => {
    expect(RULE_NAMES).toHaveLength(13)
  })

  for (const name of RULE_NAMES) {
    it(`${name} is set to error on src`, () => {
      expect(src?.rules?.[`topclass/${name}`], name).toBe('error')
    })
  }

  it('turns none of them off anywhere for src itself', () => {
    const offending: string[] = []
    for (const block of blocks) {
      const files = block.files ?? []
      const coversSrcSource = files.some((f) => f === 'src/**/*.{ts,tsx}' || f === 'src/**')
      if (!coversSrcSource) continue
      for (const [rule, level] of Object.entries(block.rules ?? {})) {
        if (rule.startsWith('topclass/') && level === 'off') offending.push(`${rule} in ${files.join(',')}`)
      }
    }
    expect(offending).toEqual([])
  })

  it('records which rules the test and dummy exemption switches off', () => {
    const exempt = blocks.filter((b) => (b.files ?? []).some((f) => f.includes('dummy') || f.includes('test')))
    const off = exempt.flatMap((b) =>
      Object.entries(b.rules ?? {}).filter(([r, l]) => r.startsWith('topclass/') && l === 'off').map(([r]) => r))
    // Each of these rules is written "inside src/", and a test or a demo is inside src/:
    // one has to write the banned string to prove the rule, the other to show real usage.
    expect([...new Set(off)].sort()).toEqual([
      'topclass/logical-properties-only',
      'topclass/semantic-classes-only',
      'topclass/shared-class-constants',
      'topclass/style-sets-tokens-only',
      'topclass/text-comes-from-labels',
    ])
  })
})
