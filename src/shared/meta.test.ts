import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CATEGORIES, RENDERINGS, STATUSES, TIERS, type ComponentMeta } from './meta.js'

// R-8.3-4 for the catalog: the contract is a type, so this proves every file wears it.
const COMPONENTS = join(process.cwd(), 'src', 'components')

const folders = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

const withMeta = folders.filter((slug) =>
  readdirSync(join(COMPONENTS, slug)).includes('meta.ts'))

describe('every meta.ts answers to one contract', () => {
  it('finds the files, so an empty catalog cannot pass', () => {
    expect(withMeta.length).toBeGreaterThan(0)
  })

  for (const slug of withMeta) {
    it(`${slug} declares a complete, valid row`, async () => {
      const loaded = await import(`../components/${slug}/meta.ts`) as { meta?: ComponentMeta }
      const meta = loaded.meta
      expect(meta, slug).toBeDefined()
      if (!meta) return

      expect(meta.slug, 'slug is the folder name, which is the docs route').toBe(slug)
      // Membership alone proves the TypeScript type and nothing about the row.
      const pascal = slug.split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
      expect(meta.name).toBe(pascal)
      expect(CATEGORIES).toContain(meta.category)
      expect(RENDERINGS).toContain(meta.rendering)
      expect(STATUSES).toContain(meta.status)
      expect(TIERS).toContain(meta.tier)
      expect(Array.isArray(meta.optionalDeps)).toBe(true)
    })

    it(`${slug} names a Base UI range whenever it names a part (R-20-1)`, async () => {
      const loaded = await import(`../components/${slug}/meta.ts`) as { meta?: ComponentMeta }
      const meta = loaded.meta
      if (!meta) return
      if (meta.baseUi !== null) expect(meta.baseUiRange, slug).not.toBeNull()
    })

    it(`${slug} reports the rendering its folder actually has`, async () => {
      const loaded = await import(`../components/${slug}/meta.ts`) as { meta?: ComponentMeta }
      const meta = loaded.meta
      if (!meta) return
      const files = readdirSync(join(COMPONENTS, slug))
      const client = files.includes('client.tsx')
      expect(meta.rendering === 'server', `${slug} has client.tsx`).toBe(!client)
    })

    it(`${slug} is not called stable while PLAN 20 is unfinished`, async () => {
      const loaded = await import(`../components/${slug}/meta.ts`) as { meta?: ComponentMeta }
      const meta = loaded.meta
      if (!meta) return
      // The visual matrix and the docs page need Playwright and the docs app.
      expect(meta.status, `${slug} claims stable before the visual matrix exists`).not.toBe('stable')
    })
  }
})
