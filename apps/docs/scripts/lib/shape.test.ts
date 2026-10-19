import { describe, expect, it } from 'vitest'

import { SECTIONS } from '../../content/sections.js'
import { demoMapSource } from './demo-map.js'
import { generatedProblems } from './shape.js'

const sections = SECTIONS.map((section) => ({
  id: section.id, title: section.title, lead: section.lead, slugs: [...section.slugs], pages: [...section.pages], count: section.slugs.length,
}))

const entry = (slug: string, demos: { name: string; key: string; source: string }[]) => ({
  slug,
  name: 'Button',
  rendering: 'server',
  status: 'beta',
  tier: 1,
  category: 'actions',
  baseUi: null,
  clientBytes: null,
  section: 'actions',
  order: 0,
  card: true,
  page: true,
  files: { client: false, schema: true, playground: false, states: true },
  content: null,
  props: [{ name: 'Button', rows: [] }],
  controls: [{ prop: 'loading', kind: 'switch', default: false }],
  demos,
})

const demo = { name: 'variants', key: 'button/variants', source: "import { Button } from 'topclassui/button'\n" }
const allSlugs = SECTIONS.flatMap((section) => [...section.slugs, ...section.pages])
const others = allSlugs.filter((slug) => slug !== 'button').map((slug) => entry(slug, []))

const good = () => ({
  components: { sections, components: [entry('button', [demo]), ...others] },
  toc: { en: { css: [{ text: 'The three lines', id: 'the-three-lines' }] }, ar: {} },
  dates: { components: Object.fromEntries(['button', ...others.map((o) => o.slug)].map((slug) => [slug, '2026-10-17T19:21:06+03:00'])), pages: {} },
  demos: demoMapSource([{ slug: 'button', name: 'variants' }]),
})

const exists = () => true

describe('generatedProblems', () => {
  it('passes output in the shape S7 gives', () => {
    expect(generatedProblems(good(), exists)).toEqual([])
  })

  it('reports a source that still imports from the library tree', () => {
    const generated = good()
    generated.components.components[0] = entry('button', [{ ...demo, source: "import { cn } from '#shared/cn.js'\nimport { X } from '../index.js'" }])
    expect(generatedProblems(generated, exists)).toEqual(['components.json: button/variants still imports #shared/cn.js, ../index.js'])
  })

  it('reports a demo map that disagrees with components.json, and a demo with no source', () => {
    const generated = { ...good(), demos: demoMapSource([{ slug: 'button', name: 'tones' }]) }
    expect(generatedProblems(generated, () => false)).toEqual([
      'demos.ts: the keys differ from components.json',
      'demos.ts: button/tones has no source file',
    ])
  })

  it('reports a section slug with no folder, and a date that is not ISO', () => {
    const generated = good()
    generated.components.components = generated.components.components.filter((c) => c.slug !== 'kbd')
    generated.dates.components['kbd'] = 'yesterday'
    expect(generatedProblems(generated, exists)).toEqual([
      'dates.json components.kbd: Invalid ISO datetime',
      'components.json: section slug kbd has no component folder',
    ])
  })

  it('reports a wrong field by its path, and stops before the cross checks', () => {
    const generated = good()
    generated.components.components[0] = { ...entry('button', [demo]), rendering: 'edge' }
    expect(generatedProblems(generated, exists)).toEqual([
      'components.json components.0.rendering: Invalid option: expected one of "server"|"split"|"client"',
    ])
  })
})
