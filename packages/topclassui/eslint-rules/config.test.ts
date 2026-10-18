// The rules existing is not the same as the project arming them, and nothing else checks it.
import { ESLint } from 'eslint'
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

  it('declares twenty-one rules, so a new one cannot be forgotten silently', () => {
    expect(RULE_NAMES).toHaveLength(21)
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
      'topclass/no-fetch-in-components',
      'topclass/no-physical-placement',
      'topclass/semantic-classes-only',
      'topclass/shared-class-constants',
      'topclass/style-sets-tokens-only',
      'topclass/text-comes-from-labels',
    ])
  })

  // R-5.2-6 has no "inside src/" clause, so the files outside src/ that carry className follow it too.
  for (const file of ['e2e/fixtures/accordion.tsx', 'e2e/axe.spec.ts', 'scripts/build-harness.tsx']) {
    it(`arms bare-data-variants on ${file}`, async () => {
      const resolved = (await new ESLint({ cwd: import.meta.dirname + '/..' }).calculateConfigForFile(file)) as Entry
      expect(resolved.rules?.['topclass/bare-data-variants'], file).toEqual([2])
    })
  }

  it('leaves the injected broken source of scripts/mutations unlinted for it', async () => {
    const resolved = (await new ESLint({ cwd: import.meta.dirname + '/..' }).calculateConfigForFile('scripts/mutations/x.ts')) as Entry
    expect(resolved.rules?.['topclass/bare-data-variants']).toBeUndefined()
  })
})

describe('R-5.3-4: the placement exemption stops at tests', () => {
  it('leaves no-physical-placement armed on demos, which show real usage', () => {
    const demoOff = blocks.filter((b) => (b.files ?? []).some((f) => f.includes('dummy'))
      && b.rules?.['topclass/no-physical-placement'] === 'off')
    expect(demoOff).toEqual([])
  })

  it('keeps R-8.5-2 on for demos, which ship', () => {
    const dummy = blocks.filter((b) => (b.files ?? []).some((f) => f.includes('dummy')))
    expect(dummy.map((b) => b.rules?.['topclass/no-fetch-in-components'])).toEqual([undefined])
  })

  it('lets the Banner store, and only it, use localStorage', () => {
    const allowing = blocks.filter((b) => Array.isArray(b.rules?.['topclass/no-fetch-in-components']))
    expect(allowing.map((b) => b.files)).toEqual([['src/components/banner/lib.ts']])
    expect(allowing[0]?.rules?.['topclass/no-fetch-in-components']).toEqual(['error', { allow: ['localStorage'] }])
  })
})
