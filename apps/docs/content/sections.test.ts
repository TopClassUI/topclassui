import { describe, expect, it } from 'vitest'

import { componentFolders } from '../scripts/lib/library.js'
import { SECTIONS } from './sections.js'

describe('content/sections.ts', () => {
  it('holds the seven sections in the catalog order, with the counts Figma draws', () => {
    expect(SECTIONS.map((section) => `${section.id} ${String(section.slugs.length)}`))
      .toEqual(['actions 4', 'forms 13', 'display 7', 'data 4', 'feedback 6', 'overlays 6', 'navigation 6'])
  })

  it('holds exactly the 46 catalog slugs, each once', () => {
    const slugs = SECTIONS.flatMap((section) => section.slugs)
    expect(slugs).toHaveLength(46)
    expect(new Set(slugs).size).toBe(46)
  })

  it('lists Field, Form and Meter as pages without a card, under Forms and Feedback', () => {
    expect(SECTIONS.filter((section) => section.pages.length > 0).map((section) => [section.id, [...section.pages]]))
      .toEqual([['forms', ['field', 'form']], ['feedback', ['meter']]])
  })

  it('names a component folder for every slug, and leaves out only the icon helpers', () => {
    const listed = new Set<string>(SECTIONS.flatMap((section) => [...section.slugs, ...section.pages]))
    expect(componentFolders().filter((slug) => !listed.has(slug))).toEqual(['icon', 'icon-registry', 'svg'])
  })

  it('gives every section a title and a lead in both locales', () => {
    for (const section of SECTIONS) {
      expect(section.title.ar.length, section.id).toBeGreaterThan(0)
      expect(section.lead.en.length, section.id).toBeGreaterThan(0)
      expect(section.lead.ar.length, section.id).toBeGreaterThan(0)
    }
  })
})
