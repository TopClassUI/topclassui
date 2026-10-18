import { readFileSync, readdirSync } from 'node:fs'
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
      // A split or client folder calling itself server would make the 0 KB claim false.
      const files = readdirSync(join(COMPONENTS, slug))
      if (files.includes('client.tsx')) expect(meta.rendering, slug).not.toBe('server')
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

// PLAN 18 is the source of C, Sp and S; R-5.1-2 trusts meta.rendering, so meta must agree with it.
const PLAN_CODES = { C: 'client', Sp: 'split', S: 'server' } as const

/** Catalog names whose slug is not the kebab-case of the first name. */
const SLUG_OF: Record<string, string> = {
  'Alert / Callout': 'alert',
  'Drawer / Sheet': 'drawer',
  'Tag / Chip': 'tag',
  'FileUpload / Dropzone': 'file-upload',
  OTPField: 'otp-field',
}

/** Folders PLAN 18 has no row for; icon-registry is an entry point (DECISIONS 2026-09-25). */
const NO_ROW = new Set(['icon-registry'])

/** Folders whose rendering departs from PLAN 18, each with its DECISIONS entry. */
const DEPARTURES: Record<string, string> = {
  stepper: 'server',
  'avatar-group': 'server',
  table: 'split',
}

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

function planRenderings(plan: string): Map<string, string> {
  const section = plan.slice(plan.indexOf('# 18. Component catalog'), plan.indexOf('## 18.10'))
  const out = new Map<string, string>()
  for (const line of section.split(/\r?\n/)) {
    const [, names = '', code = ''] = line.split('|').map((cell) => cell.trim())
    if (!(code in PLAN_CODES)) continue
    const rendering = PLAN_CODES[code as keyof typeof PLAN_CODES]
    const slugs = SLUG_OF[names] !== undefined ? [SLUG_OF[names]] : names.split(',').map((n) => kebab(n.trim()))
    for (const slug of slugs) out.set(slug, rendering)
  }
  return out
}

describe('meta.rendering follows PLAN 18', () => {
  const plan = planRenderings(readFileSync(join(process.cwd(), '..', '..', 'docs', 'PLAN.md'), 'utf8'))

  it('reads the catalog, so an empty parse cannot pass', () => {
    expect(plan.get('dialog')).toBe('client')
    expect(plan.get('banner')).toBe('split')
    expect(plan.get('button')).toBe('server')
    expect(plan.get('otp-field')).toBe('client')
  })

  for (const slug of withMeta) {
    it(`${slug} renders as its PLAN 18 row says, or as a recorded departure`, async () => {
      const loaded = await import(`../components/${slug}/meta.ts`) as { meta?: ComponentMeta }
      if (NO_ROW.has(slug)) {
        expect(plan.has(slug), `${slug} now has a PLAN 18 row`).toBe(false)
        return
      }
      expect(plan.has(slug), `${slug} has no PLAN 18 row`).toBe(true)
      expect(loaded.meta?.rendering, slug).toBe(DEPARTURES[slug] ?? plan.get(slug))
    })
  }

  it('keeps each departure a departure, so none outlives its reason', () => {
    for (const [slug, rendering] of Object.entries(DEPARTURES)) expect(plan.get(slug), slug).not.toBe(rendering)
  })
})
