// The browser spec runs axe on every demo page; this runs it on every cell, under the mutations too.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import axe from 'axe-core'
import type { ComponentType, ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Separator } from '../index.js'

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

/** happy-dom computes no colours, so contrast is left to e2e/axe.spec.ts in a real browser. */
async function audit(element: ReactElement) {
  const { container } = render(element)
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  return {
    violations: results.violations.map((v) => v.id),
    passes: results.passes.map((v) => v.id),
  }
}

describe('axe reads the role in this environment, so a clean result means something', () => {
  it('rejects aria-orientation on role none, which is why the decorative form drops it', async () => {
    const { violations } = await audit(<div role="none" aria-orientation="vertical" />)
    expect(violations).toEqual(['aria-allowed-attr'])
  })
})

describe('every cell is clean', () => {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    it(`${orientation}, decorative: no violation, and the role is one axe allows`, async () => {
      const { violations, passes } = await audit(<Separator orientation={orientation} />)
      expect(violations).toEqual([])
      expect(passes).toContain('aria-allowed-role')
    })

    it(`${orientation}, not decorative: no violation, and aria-orientation was checked`, async () => {
      const { violations, passes } = await audit(<Separator orientation={orientation} decorative={false} />)
      expect(violations).toEqual([])
      expect(passes).toContain('aria-allowed-attr')
      expect(passes).toContain('aria-valid-attr-value')
    })
  }
})

describe('every demo is clean', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBeGreaterThan(3)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} has no axe violation`, async () => {
      expect((await audit(<Demo />)).violations).toEqual([])
    })
  }
})
