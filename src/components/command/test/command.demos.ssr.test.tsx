import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { type ComponentType, createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** The label of each demo's one trigger, a Button. Named, so a deleted demo fails here. */
const TRIGGERS: Record<string, string> = {
  'basic': 'Search',
  'empty-state': 'Find a command',
  'groups': 'Commands by group',
  'loading': 'Commands that are loading',
  'long-content': 'Every hostile case',
  'long-page': 'Jump to a section',
  'rtl': 'بحث',
  'skeleton': 'Commands that load with a skeleton',
  'ten-thousand': 'Ten thousand commands',
  'thousand': 'A thousand commands',
  'with-shortcuts': 'Commands with shortcuts',
  'with-tooltip': 'Find or ask',
}

const DEMOS = await Promise.all(files.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

describe('every demo renders on the server as its trigger alone', () => {
  it('the table names every demo in the folder', () => {
    expect(files).toEqual(Object.keys(TRIGGERS).sort())
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name}: one button, ${TRIGGERS[name] ?? '?'}, and no dialog, listbox or input before the first open`, () => {
      const html = markup(createElement(Demo))
      expect(html.match(/<button/g)).toHaveLength(1)
      expect(html).toContain(TRIGGERS[name])
      expect(html).not.toMatch(/role="(dialog|listbox|combobox)"|<input/)
    })
  }

  it('each demo is a client file: it holds the open state and the functions the palette reads', () => {
    for (const name of files) expect(readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'"), name).toBe(true)
  })
})
